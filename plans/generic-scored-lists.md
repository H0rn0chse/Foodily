# Generic Scored Lists — Implementation Plan

## 1. Goal

Extend Foodily with private, generic lists for tracking arbitrary food-related subjects, for example:

- wines previously tasted;
- food delivery services;
- restaurants to revisit;
- cheeses, coffee beans, or dishes to try.

Lists are primarily comparison tools. Instead of storing a strict manual rank, each item receives a **combined score calculated from custom score properties defined by the list owner**. Items are displayed in descending combined-score order by default.

The initial version is private to the authenticated owner. Sharing, collaboration, and public links are explicitly out of scope, but the ownership model must permit those capabilities to be added later.

## 2. MVP product rules

### 2.1 Lists

Each list has:

- a required title;
- an optional description;
- zero or more custom property definitions;
- zero or more items.

### 2.2 Items

Each item has:

- a required name;
- optional values for the list's custom properties;
- a read-only combined score calculated from its populated score properties.

There is no persisted rank and no requirement that items occupy positions `1…N`. Equal combined scores are valid. The UI may show an item's display position in the currently sorted result, but that position is not stored and is not part of the domain model.

Duplicate item names are allowed because the same product or provider may be recorded more than once in different contexts.

### 2.3 Custom properties

The MVP supports these primitive property types:

- `text`;
- `number`;
- `boolean`;
- `date`.

Every property value is optional. In particular, optional values must distinguish:

- an unset value from an empty string;
- an unset value from numeric zero;
- an unset value from boolean `false`.

Properties can be renamed, reordered for display, or deleted. A property's primitive type cannot be changed after creation because converting existing values would be ambiguous.

### 2.4 Score properties

In the MVP, any `number` property can optionally contribute to the combined score. A scored number property has this configuration:

- **minimum**: lower bound of the accepted raw value;
- **maximum**: upper bound of the accepted raw value, greater than minimum;
- **weight**: positive relative importance; default `1`;
- **direction**:
  - `higher_is_better`, for properties such as taste or reliability;
  - `lower_is_better`, for properties such as price or delivery time.

Text, boolean, and date properties do not contribute to scoring in the first version. Supporting boolean mappings or date-decay formulas can be added later without changing the list/item ownership model.

Score configuration can be edited after property creation. Changes immediately affect all calculated item scores; raw item values remain unchanged. If bounds are changed so an existing value is outside the new range, reject the configuration change and identify that existing values must first be corrected.

### 2.5 Combined-score formula

Normalize every populated score property to a value between `0` and `1`:

```text
higher_is_better: (value - minimum) / (maximum - minimum)
lower_is_better:  (maximum - value) / (maximum - minimum)
```

Calculate the combined score as a weighted average and expose it on a `0…100` scale:

```text
combinedScore = 100 * sum(normalizedValue * weight) / sum(populatedPropertyWeights)
```

Rules:

- only populated score properties participate in the numerator and denominator;
- an item with no populated score properties has `combinedScore: null`, not zero;
- raw values must remain within the configured inclusive bounds;
- return the combined score rounded to two decimal places for display/API consistency;
- calculate using unrounded normalized values and round only the final result;
- ties are allowed;
- default ordering is combined score descending, then item name ascending, then item ID ascending for deterministic results;
- items with `null` combined scores appear after scored items.

Ignoring missing score properties avoids silently treating “not evaluated” as “bad.” The UI must make incomplete scoring visible, for example by showing `2/3 score properties completed`. A configurable missing-value policy is out of scope for the MVP.

### 2.6 Example

A wine list could define:

| Property | Type | Scored | Bounds | Weight | Direction |
|---|---|---:|---|---:|---|
| Winery | Text | No | — | — | — |
| Vintage | Number | No | — | — | — |
| Taste | Number | Yes | 0–10 | 3 | Higher is better |
| Price | Number | Yes | 0–100 | 1 | Lower is better |
| Tasted on | Date | No | — | — | — |
| Would buy again | Boolean | No | — | — | — |

For `Taste = 8` and `Price = 40`, the score is:

```text
Taste normalized = 0.8
Price normalized = 0.6
Combined = 100 * ((0.8 * 3) + (0.6 * 1)) / 4 = 75
```

## 3. Database design

Create a migration under:

`/mnt/d/Aaron/Dev/Foodily/src/server/migrations/<timestamp>_add_generic_lists.js`

### 3.1 `lists`

| Column | Definition |
|---|---|
| `id` | `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY` |
| `owner_id` | required FK to `users(id)`, `ON DELETE CASCADE` |
| `title` | required text |
| `description` | nullable text |
| `created_at` | timestamp, default `NOW()` |
| `updated_at` | timestamp, default `NOW()` |

Add indexes for `owner_id` and `(owner_id, updated_at DESC)`.

### 3.2 `list_properties`

| Column | Purpose |
|---|---|
| `id` | identity primary key |
| `list_id` | required FK to `lists`, cascading delete |
| `label` | required display label |
| `property_type` | `text`, `number`, `boolean`, or `date` |
| `display_position` | order in forms and tables |
| `contributes_to_score` | whether a number property affects the score |
| `score_minimum` | nullable numeric lower bound |
| `score_maximum` | nullable numeric upper bound |
| `score_weight` | nullable positive numeric weight |
| `score_direction` | nullable `higher_is_better` or `lower_is_better` |

Database constraints must enforce:

- the primitive type allowlist;
- positive display positions unique within a list;
- case-insensitively unique labels within a list;
- score configuration is either completely absent or complete;
- only number properties may contribute to scoring;
- `score_maximum > score_minimum`;
- `score_weight > 0`;
- the score-direction allowlist.

### 3.3 `list_items`

| Column | Purpose |
|---|---|
| `id` | identity primary key |
| `list_id` | required FK to `lists`, cascading delete |
| `name` | required item name |
| `created_at` | timestamp, default `NOW()` |
| `updated_at` | timestamp, default `NOW()` |

Add an index on `list_id`. Do not add a rank or manual-position column.

### 3.4 `list_item_values`

Use typed optional values rather than an unvalidated JSON object.

| Column | Purpose |
|---|---|
| `list_id` | owning list ID |
| `item_id` | item FK, cascading delete |
| `property_id` | property FK, cascading delete |
| `value_text` | nullable text value |
| `value_number` | nullable numeric value |
| `value_boolean` | nullable boolean value |
| `value_date` | nullable date value |

Use a unique or primary key over `(item_id, property_id)`. Add composite foreign keys or equivalent constraints so the item and property must belong to the same list. Ensure exactly one typed value column is populated in each stored row. An absent row represents an unset value.

The server remains responsible for verifying that the populated typed column matches the property's declared type and that scored numbers are within their configured bounds.

### 3.5 Score storage decision

Do **not** persist `combined_score` in the MVP. Compute it from property definitions and item values when reading list details. This prevents stale scores when a weight, direction, bound, or item value changes.

The initial expected lists are small enough for query-time calculation. If performance later requires denormalization, add a materialized/generated score strategy together with reliable invalidation and database-level tests.

### 3.6 Change tracking

Add the existing `set_updated_at()` trigger to lists and list items, or create equivalent triggers following the current migration convention.

Any property or item-value mutation must also update the parent list's `updated_at`. The parent timestamp is the cache token for list details and contributes to the overview cache token.

## 4. Effect on transaction support

Update `/mnt/d/Aaron/Dev/Foodily/src/server/src/db.ts` to use `pg.Pool` in place of the singleton `pg.Client`. Preserve the existing `db.query(...)` interface and add a scoped transaction helper that checks out a pool client, runs `BEGIN`, commits or rolls back, and always releases the client.

Use that helper for every multi-statement list write:

- create or update an item with one or more custom values;
- create, update, delete, or reorder a property when parent-list metadata is also updated;
- update score bounds after checking existing values;
- delete a property and its values while updating the parent-list cache timestamp.

## 5. Shared TypeScript contracts

Add:

`/mnt/d/Aaron/Dev/Foodily/src/types/list.d.ts`

Define at least:

- `ListId`;
- `ListSummary`;
- `ListDetails`;
- `ListCreate`;
- `ListProperty`;
- `ListPropertyType`;
- `ScoreDirection`;
- `ScoreConfiguration`;
- `ListItem`;
- `ListItemCreate`;
- `ListItemUpdate`;
- `ListPrimitiveValue`.

Suggested response shape:

```ts
type ListPropertyType = "text" | "number" | "boolean" | "date";
type ScoreDirection = "higher_is_better" | "lower_is_better";

type ScoreConfiguration = {
  minimum: number;
  maximum: number;
  weight: number;
  direction: ScoreDirection;
};

type ListProperty = {
  id: string;
  label: string;
  type: ListPropertyType;
  displayPosition: number;
  score: ScoreConfiguration | null;
};

type ListItem = {
  id: string;
  name: string;
  values: Record<string, string | number | boolean>;
  combinedScore: number | null;
  populatedScorePropertyCount: number;
  totalScorePropertyCount: number;
};

type ListDetails = {
  id: string;
  title: string;
  description: string | null;
  properties: ListProperty[];
  items: ListItem[];
};
```

Dates cross the API as `YYYY-MM-DD` strings and therefore use the string branch of `ListPrimitiveValue`.

## 6. Private API

Create:

`/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/lists.ts`

Register it under `/api/v1/lists` in:

`/mnt/d/Aaron/Dev/Foodily/src/server/src/routes/api.ts`

### 6.1 List management

| Method | Endpoint | Behavior |
|---|---|---|
| `GET` | `/api/v1/lists` | Paginated private list overview |
| `POST` | `/api/v1/lists` | Create a list |
| `GET` | `/api/v1/lists/:listId` | Return properties, items, and calculated scores |
| `PUT` | `/api/v1/lists/:listId` | Update title and/or description |
| `DELETE` | `/api/v1/lists/:listId` | Delete the list and children |

The overview follows the existing `page`, `limit`, and `search` conventions. Search titles and descriptions. Each summary returns `itemCount` and `updatedAt`.

The detail endpoint supports these optional query parameters:

- `sort=score|name|createdAt`, default `score`;
- `direction=asc|desc`, with a sort-appropriate default;
- `search`, matching item names and text-property values.

Score remains a calculated response property regardless of selected sorting.

### 6.2 Property builder

| Method | Endpoint | Behavior |
|---|---|---|
| `POST` | `/api/v1/lists/:listId/properties` | Append a custom property |
| `PUT` | `/api/v1/lists/:listId/properties/:propertyId` | Rename it or update score configuration |
| `DELETE` | `/api/v1/lists/:listId/properties/:propertyId` | Delete it and its values |
| `PUT` | `/api/v1/lists/:listId/properties/order` | Save display order |

Property order affects display only, not item score or sort order.

Suggested scored property body:

```json
{
  "label": "Taste",
  "type": "number",
  "score": {
    "minimum": 0,
    "maximum": 10,
    "weight": 3,
    "direction": "higher_is_better"
  }
}
```

Suggested property-order body:

```json
{
  "propertyIds": ["8", "3", "12"]
}
```

The server verifies that the order array contains every current property exactly once.

### 6.3 Item management

| Method | Endpoint | Behavior |
|---|---|---|
| `POST` | `/api/v1/lists/:listId/items` | Create an item and optional values |
| `PUT` | `/api/v1/lists/:listId/items/:itemId` | Save item name and primitive values atomically |
| `DELETE` | `/api/v1/lists/:listId/items/:itemId` | Delete an item |

There are no item-order or ranking endpoints.

Suggested item body:

```json
{
  "name": "2021 Riesling",
  "values": {
    "4": "Mosel",
    "5": 2021,
    "6": 8,
    "7": 40,
    "8": true,
    "9": "2026-08-30"
  }
}
```

For updates, a value of `null` clears that optional property. Omitting a property ID leaves its current value unchanged. The create endpoint treats omitted and `null` values as unset.

### 6.4 Ownership and privacy

Every list query is scoped through:

```sql
lists.owner_id = authenticatedUser.id
```

Nested property and item operations verify ownership through the parent list, not only through child IDs.

- Return `404` for missing lists and lists owned by another user to avoid disclosing their existence.
- Do not add public identifiers, share tokens, visibility flags, or routes in the public Vue app.
- Do not infer list access from dinner participants or virtual users.

## 7. Server-side validation and score calculation

Implement reusable list validation and score-calculation functions rather than duplicating rules across route handlers.

Validate:

- trimmed, required, bounded list titles;
- optional bounded descriptions;
- trimmed, required, bounded item names;
- trimmed, required, bounded property labels;
- a strict primitive-type allowlist;
- a strict score-direction allowlist;
- a practical property limit per list, for example 25;
- complete score configuration for scored number properties;
- finite minimum, maximum, weight, and numeric values;
- maximum greater than minimum;
- positive weight;
- scored values within inclusive configured bounds;
- valid `YYYY-MM-DD` date strings;
- actual booleans rather than truthy strings;
- property IDs belonging to the target list;
- complete, duplicate-free property-order arrays;
- non-empty update bodies.

Calculate scores in SQL for list reads where practical, so sorting and pagination use the same value returned by the API. Keep a pure TypeScript score helper as the canonical formula for focused unit tests, or test the SQL formula directly against PostgreSQL test fixtures. Avoid calculating one score for sorting and a separate implementation for response serialization.

## 8. API documentation

Add:

`/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/lists.json`

Update shared schemas in:

`/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/api.json`

Register the list API document in:

`/mnt/d/Aaron/Dev/Foodily/src/server/src/routes/api.ts`

Document:

- list, property, and item CRUD;
- primitive types;
- score configuration and formula;
- missing-value behavior;
- score completeness metadata;
- ties and deterministic default ordering;
- validation responses;
- owner-only behavior;
- cache tokens.

## 9. Private frontend store

Add:

`/mnt/d/Aaron/Dev/Foodily/src/app/src/stores/list.ts`

Reuse existing abstractions where they fit:

- `ApiList<ListSummary, ListCreate>` for list overview;
- `ApiItemMap<ListDetails>` for list details.

Follow the conventions in `/mnt/d/Aaron/Dev/Foodily/src/app/src/stores/dinner.ts` and expose methods for:

- creating, updating, and deleting lists;
- adding, editing, deleting, and reordering display properties;
- adding, editing, and deleting items;
- reloading detail data after nested mutations;
- passing item sort/search parameters to the detail endpoint.

Property-order requests and item payloads use direct `fetch` calls because they do not fit the current generic `ApiList.create()` abstraction cleanly.

## 10. Routes and navigation

Update `/mnt/d/Aaron/Dev/Foodily/src/app/src/router.ts` with:

- `/lists`;
- `/lists/:listId`.

Update `/mnt/d/Aaron/Dev/Foodily/src/app/src/App.vue` with a private **Lists** navigation entry next to Dinners.

Do not change `/mnt/d/Aaron/Dev/Foodily/src/app-public` for this feature.

## 11. List manager UI

Add:

`/mnt/d/Aaron/Dev/Foodily/src/app/src/views/list/ListView.vue`

The overview provides:

- title;
- optional description preview;
- item count;
- last-modified date;
- search;
- existing server-side pagination behavior;
- create-list action;
- navigation to list details.

Use the dinner overview as the structural reference. Creation should open a small dialog requiring a title instead of first persisting a placeholder name.

## 12. List builder and scored-item UI

Add:

`/mnt/d/Aaron/Dev/Foodily/src/app/src/views/list/ListDetailView.vue`

### 12.1 Header

- Back button
- Editable title
- Editable description
- Delete-list action

### 12.2 Property manager

Provide a dialog or expansion panel with:

- label;
- primitive type;
- “Contributes to score” switch for number properties;
- minimum and maximum;
- weight;
- higher/lower-is-better selector;
- score-configuration explanation and validation;
- move-up/move-down display controls;
- delete action;
- add-property action.

No drag-and-drop library is currently installed, so use up/down controls for display order in the MVP.

### 12.3 Item table/cards

Display:

- item name;
- combined score;
- scoring completeness, such as `2/3`;
- dynamically configured properties;
- edit action;
- delete action.

Default to combined-score descending. Allow sorting by name and creation date. Do not display or persist a rank number. Equal scores remain equal rather than receiving an artificial tie-breaking rank; deterministic secondary ordering only stabilizes presentation.

For narrow screens, use item cards or hide secondary custom properties behind the editor rather than forcing a very wide table.

### 12.4 Item editor

Add components such as:

- `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ListItemDialog.vue`;
- `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ListPropertyManager.vue`;
- `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/PrimitivePropertyInput.vue`;
- `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ScorePreview.vue`.

Render controls by type:

| Type | Vuetify control |
|---|---|
| Text | clearable `v-text-field` |
| Number | numeric `v-text-field`, with score bounds where applicable |
| Boolean | clearable three-state select |
| Date | clearable date input |

Show a live score preview while editing, but treat the server response as authoritative after save. Use explicit Save/Cancel actions so the item and all changed values are persisted atomically.

## 13. Localization

Update only:

`/mnt/d/Aaron/Dev/Foodily/src/app/src/i18n/en.json`

Add English strings for:

- navigation and overview;
- list/property/item actions;
- primitive property types;
- score options and formula help;
- score completeness and no-score states;
- validation errors;
- empty, loading, and not-found states;
- delete confirmations.

Do not update `/mnt/d/Aaron/Dev/Foodily/src/app/src/i18n/de.json` in this scope. The existing `fallbackLocale: "en"` setting in `/mnt/d/Aaron/Dev/Foodily/src/app/src/lang.ts` makes German-locale users fall back to the new English strings, so no localization configuration change is required.

## 14. Development seed data

Extend `/mnt/d/Aaron/Dev/Foodily/src/server/src/testDataSeed.ts` with generic examples for the local admin.

### Wine list

- Winery — text
- Vintage — unscored number
- Taste — scored number, `0…10`, weight `3`, higher is better
- Price — scored number, `0…100`, weight `1`, lower is better
- Tasted on — date
- Would buy again — boolean

### Delivery-service list

- Cuisine — text
- Food quality — scored number, `0…5`, weight `3`, higher is better
- Delivery time — scored number, `0…120`, weight `1`, lower is better
- Delivery cost — scored number, `0…20`, weight `1`, lower is better
- Last ordered — date
- Delivers to us — boolean

Include complete and partially scored items to exercise missing-score behavior and ties.

## 15. Future sharing path

Do not implement sharing in the MVP.

The design remains extensible because each list has a stable owner and all child authorization flows through the parent list. A future migration can add, for example:

- `list_access(list_id, user_id, role)` for explicit viewers/editors;
- a separate revocable-token table for public links.

Do not add an unused `public` flag, visibility enum, or share token now. Introduce permissions only when sharing behavior is defined and can be tested end to end.

## 16. Implementation handoff sequence

Complete the following steps in order. Do not add a sharing model, public routes, manual item ranks, or German translation keys.

### Step 1 — Define the shared list contracts

1. Create `/mnt/d/Aaron/Dev/Foodily/src/types/list.d.ts` using the contracts in section 5.
2. Ensure identifiers are represented as strings at the API/client boundary, matching `/mnt/d/Aaron/Dev/Foodily/src/types/api.d.ts` and `/mnt/d/Aaron/Dev/Foodily/src/types/dinner.d.ts`.
3. Represent dates as `YYYY-MM-DD` strings and allow `combinedScore` to be `null`.
4. Add request types for list creation/update, property creation/update/order, and item creation/update so server and client payloads have one documented shape.

### Step 2 — Add pooled database access and transactions

1. Update `/mnt/d/Aaron/Dev/Foodily/src/server/src/db.ts` to construct and connect a `pg.Pool` from `DB_CONNECTION_STRING`.
2. Keep the default export compatible with existing route calls to `db.query(...)`.
3. Add and export a transaction helper accepting an async callback with a checked-out `PoolClient`.
4. Ensure the helper begins a transaction, commits successful callbacks, rolls back thrown failures, and releases the client in `finally`.
5. Update the local seed function typing in `/mnt/d/Aaron/Dev/Foodily/src/server/src/testDataSeed.ts` to accept the query-capable client/pool type used by startup seeding.
6. Confirm the existing users, dinners, food preferences, and startup seed paths still compile without route changes.

### Step 3 — Add the schema migration

1. Create `/mnt/d/Aaron/Dev/Foodily/src/server/migrations/<timestamp>_add_generic_lists.js`.
2. Create the `lists`, `list_properties`, `list_items`, and `list_item_values` tables exactly as described in section 3.
3. Add foreign keys, cascading deletion, indexes, uniqueness constraints, type/configuration checks, and typed-value checks.
4. Add `created_at`/`updated_at` defaults and triggers for list and item updates, reusing the existing `set_updated_at()` function when available.
5. Ensure property/value mutations update `lists.updated_at`, either through database triggers or explicitly in the API transaction.
6. Write a complete `down` migration that drops new triggers before tables and does not drop shared pre-existing functions still used by `dinners` or `users`.
7. Run the migration against a local disposable database before proceeding.

### Step 4 — Seed representative local data

1. Extend `/mnt/d/Aaron/Dev/Foodily/src/server/src/testDataSeed.ts` after the existing user seed data.
2. Create the wine and delivery-service lists from section 14 for the admin user.
3. Insert their properties, including both scored and unscored number properties.
4. Insert complete, incomplete, and tied-score items with typed values.
5. Keep seeding idempotent through the existing empty-database guard; do not seed duplicate data into an existing database.

### Step 5 — Implement server helpers and list API

1. Create `/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/lists.ts`.
2. Add private helpers in that module, or a colocated list utility module, for request validation, property/value normalization, parent-list ownership lookup, score calculation/query fragments, and cache-token updates.
3. Enforce all section 7 validation rules before issuing writes, including the distinction between omitted values and explicit `null` clears.
4. Calculate the combined score from the documented formula in section 2.5. Use one canonical calculation for returned values and score sorting.
5. Implement `GET /`, `POST /`, `GET /:listId`, `PUT /:listId`, and `DELETE /:listId` as specified in section 6.1.
6. Implement property create, update, delete, and display-order endpoints from section 6.2. Reject primitive-type changes; allow only label and score-configuration updates.
7. Implement item create, update, and delete endpoints from section 6.3. Wrap multi-statement writes in the transaction helper.
8. Scope every list and nested-resource query to `(req.user as AuthenticatedUser).id`; return `404` when the owned resource is absent.
9. Return existing `ItemResponse` and `ListResponse` envelopes, including cache tokens compatible with `ApiItem` and `ApiList`.
10. Register `listsRouter` at `/lists` in `/mnt/d/Aaron/Dev/Foodily/src/server/src/routes/api.ts`.

### Step 6 — Add OpenAPI documentation

1. Create `/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/lists.json` with every endpoint from section 6.
2. Add shared list, property, score-configuration, item, and response schemas to `/mnt/d/Aaron/Dev/Foodily/src/server/src/api/v1/api.json`.
3. Import the list document and call `addSubRouterApiDocs(baseApiDoc, "/lists", listsApiDoc)` in `/mnt/d/Aaron/Dev/Foodily/src/server/src/routes/api.ts` beside the existing dinner registration.
4. Keep the documented payload names and response envelopes identical to the implemented API.

### Step 7 — Add the private client store

1. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/stores/list.ts`.
2. Instantiate `ApiList<ListSummary, ListCreate>` for `/api/v1/lists` and `ApiItemMap<ListDetails>` for `/api/v1/lists/`.
3. Provide methods for list updates/deletion, property mutations/order changes, and item mutations using `csrfHeaders` for mutating fetches.
4. After each nested mutation, invalidate/reload the active list details so the server-calculated score and cache token remain authoritative.
5. Follow the error-handling and Pinia exposure pattern in `/mnt/d/Aaron/Dev/Foodily/src/app/src/stores/dinner.ts`.

### Step 8 — Add routes, navigation, and English copy

1. Add lazy-loaded `/lists` and `/lists/:listId` routes to `/mnt/d/Aaron/Dev/Foodily/src/app/src/router.ts`.
2. Add a Lists navigation entry in `/mnt/d/Aaron/Dev/Foodily/src/app/src/App.vue` using the same active-link styling as Dinners.
3. Add all list, property, item, score, validation, and empty-state strings to `/mnt/d/Aaron/Dev/Foodily/src/app/src/i18n/en.json`.
4. Do not alter `/mnt/d/Aaron/Dev/Foodily/src/app/src/i18n/de.json`; existing English fallback is configured in `/mnt/d/Aaron/Dev/Foodily/src/app/src/lang.ts`.
5. Do not modify `/mnt/d/Aaron/Dev/Foodily/src/app-public`.

### Step 9 — Implement the list overview

1. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/views/list/ListView.vue`.
2. Reuse the pagination, search debounce, loading, and table structure from `/mnt/d/Aaron/Dev/Foodily/src/app/src/views/dinner/DinnerView.vue`.
3. Display title, description preview, item count, last-modified date, and a details action.
4. Add a create-list dialog with a required title and optional description; on success reload the overview and navigate to the new list detail route.

### Step 10 — Implement the builder and item editor

1. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/views/list/ListDetailView.vue`.
2. Load the selected `ListDetails` on mount through the list store and use `LoadingScreen`/`ConfirmationDialog` conventions already present in the dinner views.
3. Add editable title and description, back navigation, and list deletion.
4. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ListPropertyManager.vue` to add, edit, delete, and move properties by display position.
5. Restrict score configuration controls to number properties; render minimum, maximum, weight, and direction only when the property contributes to the score.
6. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/PrimitivePropertyInput.vue` to render clearable text, number, boolean, and date inputs. The boolean control must support unset, true, and false.
7. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ListItemDialog.vue` for item creation and editing. Submit the item name and changed values in one save action.
8. Create `/mnt/d/Aaron/Dev/Foodily/src/app/src/components/list/ScorePreview.vue` for the client-side live preview using the section 2.5 formula; after save, use the reloaded server value for display.
9. In `ListDetailView.vue`, render dynamic property columns or responsive cards, combined score, score completeness, sorting, edit, and delete actions. Default to score descending and do not show ranks or reordering controls for items.

### Step 11 — Build and manually verify the feature

1. Start PostgreSQL and apply the migration with `npm run start:db` and `npm run migrate:up` from `/mnt/d/Aaron/Dev/Foodily`.
2. Start the server/client development environment using the repository's configured scripts.
3. As the local admin, create a list; add each primitive property type; configure multiple scored number properties; add complete and incomplete items; and verify score calculation, score sorting, value clearing, property deletion, and list deletion.
4. Verify a German-locale browser displays the new English text through fallback.
5. Run `npm run build` and `npm run lint` from `/mnt/d/Aaron/Dev/Foodily` and resolve all feature-related errors before handoff.

## 17. Explicitly deferred scope

- Manual ranking and item reordering
- Custom score formulas
- Persisted/cached combined scores
- Boolean score mappings
- Date-based scoring or decay
- Missing-value penalty policies
- Select/multi-select properties
- Property-type conversion
- Templates and predefined wine/delivery schemas
- Images and attachments
- Sharing, collaboration, and public URLs