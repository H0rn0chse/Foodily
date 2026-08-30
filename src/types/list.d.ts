export type ListPropertyType = "text" | "number" | "boolean" | "date";
export type ScoreDirection = "higher_is_better" | "lower_is_better";

// Dates cross the API as YYYY-MM-DD strings.
export type ListPrimitiveValue = string | number | boolean;

export type ScoreConfiguration = {
  minimum: number,
  maximum: number,
  weight: number,
  direction: ScoreDirection,
};

export type ListProperty = {
  id: string,
  label: string,
  type: ListPropertyType,
  displayPosition: number,
  score: ScoreConfiguration | null,
};

export type ListItem = {
  id: string,
  name: string,
  values: Record<string, ListPrimitiveValue>,
  combinedScore: number | null,
  populatedScorePropertyCount: number,
  totalScorePropertyCount: number,
};

export type ListSummary = {
  id: string,
  title: string,
  description: string | null,
  itemCount: number,
  updatedAt: string,
};

export type ListDetails = {
  id: string,
  title: string,
  description: string | null,
  properties: ListProperty[],
  items: ListItem[],
};

export type ListCreate = {
  title: string,
  description?: string | null,
};

export type ListUpdate = {
  title?: string,
  description?: string | null,
};

export type ListPropertyCreate = {
  label: string,
  type: ListPropertyType,
  score?: ScoreConfiguration | null,
};

export type ListPropertyUpdate = {
  label?: string,
  score?: ScoreConfiguration | null,
};

export type ListPropertyOrderUpdate = {
  propertyIds: string[],
};

export type ListItemCreate = {
  name: string,
  values?: Record<string, ListPrimitiveValue | null>,
};

export type ListItemUpdate = {
  name?: string,
  values?: Record<string, ListPrimitiveValue | null>,
};

// shortcuts
export type ListId = ListDetails["id"];
export type ListPropertyId = ListProperty["id"];
export type ListItemId = ListItem["id"];
