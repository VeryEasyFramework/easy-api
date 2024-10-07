import type {
  AdvancedFilter,
  EasyField,
  EasyFieldType,
  EntityDefinition,
  FieldGroup,
  ListOptions,
  RowsResult,
} from "@vef/easy-orm";

export interface EntityRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: any;
}

export type {
  AdvancedFilter,
  EasyField,
  EasyFieldType,
  EntityDefinition,
  FieldGroup,
  ListOptions,
  RowsResult,
};
export interface DocsActionParam {
  paramName: string;
  required: boolean;
  type: EasyFieldType;
}

export interface GetListResult<T extends EntityRecord = EntityRecord> {
  rowCount: number;
  totalCount: number;
  data: T[];
  columns: string[];
}

export interface DocsAction {
  actionName: string;
  description: string;
  params: Array<DocsActionParam>;
  response?: string;
  public?: boolean;
  system?: boolean;
}

export interface DocsActionGroup {
  groupName: string;
  actions: Array<DocsAction>;
}

export interface GetListResult<T extends EntityRecord = EntityRecord> {
  rowCount: number;
  totalCount: number;
  data: T[];
  columns: string[];
}

export interface EditLog extends EntityRecord {
  entity: string;
  recordId: string;
  recordTitle: string;
  user: string;
  userFullName: string;
  action: "create" | "update" | "delete";
  editData: Record<string, any>;
}

export interface RecordInfo {
  editLog: EditLog[];
}

export interface FieldGroupDefinition {
  key: string;
  title: string;
  description?: string;
}

export interface EasyEntityConfig {
  label: string;
  description: string;
  titleField?: string;
  tableName: string;
  orderField?: string;
  orderDirection?: "asc" | "desc";
}

export type EntityHook =
  | "beforeSave"
  | "afterSave"
  | "beforeInsert"
  | "afterInsert"
  | "validate";

export interface EntityHookDefinition {
  label?: string;
  description?: string;

  action(): Promise<void> | void;
}

export type EasyEntityHooks = Record<EntityHook, Array<EntityHookDefinition>>;

export interface EntityActionParam {
  key: string;
  fieldType: EasyFieldType;
  required?: boolean;
}

export interface EntityActionDefinition {
  label?: string;
  description?: string;
  private?: boolean;
  global?: boolean;

  action(params?: Record<string, any>): Promise<void> | void;

  params?: Array<EntityActionParam>;
}

export interface EntityAction extends EntityActionDefinition {
  key: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  email: string;
  userName: string;
  systemAdmin: boolean;
}

export interface RichText {
  [key: string]: any;
}

/**
 * The choice definition for a field that's set to `ChoicesField` or `MultiChoiceField`.
 */
export interface Choice {
  key: string;
  label: string;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "accent"
    | "muted";
}

/**
 * The connected entity definition for a field that's set to `ConnectionField`.
 */

export interface FetchOptions {
  fetchEntity: string; // entity name
  thisIdKey: string; // local id key
  thisFieldKey: string; // local field key
  thatFieldKey: string; // foreign field key
}
