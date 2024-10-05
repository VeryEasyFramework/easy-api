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

export interface AdvancedFilter {
  op:
    | "contains"
    | "notContains"
    | "inList"
    | "notInList"
    | "between"
    | "notBetween"
    | "is"
    | "isNot"
    | "isEmpty"
    | "isNotEmpty"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "lessThan"
    | "greaterThanOrEqual"
    | "lessThanOrEqual"
    | "equal"
    | ">"
    | "<"
    | ">="
    | "<="
    | "="
    | "!=";

  value: any;
}

export interface ListOptions {
  columns?: string[];
  filter?: Record<string, AdvancedFilter>;
  orFilter?: Record<string, string | number | AdvancedFilter>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface FieldGroupDefinition {
  key: string;
  title: string;
  description?: string;
}

export interface FieldGroup {
  key: string;
  title: string;
  description?: string;
  fields: Array<EasyField>;
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

export interface EntityDefinition {
  entityId: string;
  fields: Array<EasyField>;
  fieldGroups: Array<FieldGroup>;
  listFields: Array<string>;
  config: EasyEntityConfig;
  hooks: EasyEntityHooks;
  actions: Array<EntityAction>;
}

export interface EntityRecord {
  id: string;
  createdAt: EasyFieldTypeMap["TimeStampField"];
  updatedAt: EasyFieldTypeMap["TimeStampField"];

  [key: string]: any;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  email: string;
  userName: string;
  systemAdmin: boolean;
}
export interface EasyFieldTypeMap {
  IDField: string;
  DataField: string;
  IntField: number;
  BigIntField: bigint;
  DecimalField: number;
  DateField: Date;
  TimeStampField: number;
  BooleanField: boolean;
  PasswordField: string;
  ChoicesField: string;
  MultiChoiceField: string[];
  TextField: string;
  EmailField: string;
  ImageField: string;
  JSONField: Record<string, any>;
  PhoneField: string;
  ConnectionField: string;
  RichTextField: RichText;
  URLField: string;
}

export interface RichText {
  [key: string]: any;
}

export type EasyFieldType = keyof EasyFieldTypeMap;

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

/**
 * The field definition for a field in an entity.
 */
export interface EasyField {
  /**
   * The key of the field. This is how the field will be accessed in the entity.
   */
  key: string;

  /**
   * The label of the field. This is how the field will be displayed in the UI.
   */
  label?: string;

  /**
   * The description of the field. This is how the field will be described in the UI.
   */
  description?: string;

  /**
   * Whether the field is required.
   */
  required?: boolean;
  /**
   * Set to true if the field should be read-only and not editable by the user.
   */
  readOnly?: boolean;
  /**
   * The type of the field.
   *
   * **DataField**: Short text data. Limited to 255 characters.
   *
   * **IntField**: Integer.
   *
   * **BigIntField**: BigInt.
   *
   * **DecimalField**: Decimal.
   *
   * **DateField**: Date.
   *
   * **TimestampField**: Date and time.
   *
   * **BooleanField**: Boolean.
   *
   * **ChoicesField**: Single choice.
   *
   * **MultiChoiceField**: Multiple choices.
   *
   * **TextField**: Long text data.
   *
   * **EmailField**: Email.
   *
   * **ImageField**: Image URL.
   *
   * **JSONField**: JSON object.
   *
   * **PhoneField**: Phone number.
   *
   * **ConnectionField**: Connection to another entity.
   *
   * **PasswordField**: Password.
   *
   * **IDField**: ID.
   */
  fieldType: EasyFieldType;

  fetchOptions?: FetchOptions;

  /**
   * Set to true if the field should be included in the default list view.
   */
  inList?: boolean;

  /**
   * The choices for the field. Only applicable for ChoicesField and MultiChoiceField.
   */
  choices?: Choice[];

  /**
   * The default value of the field. Can be a value or a function that returns a value.
   */
  defaultValue?: EasyFieldTypeMap[EasyFieldType];

  connectionEntity?: string;

  connectionTitleField?: string;

  /**
   * Set to true if the field should be unique.
   */
  unique?: boolean;

  group?: string;

  hidden?: boolean;
}
