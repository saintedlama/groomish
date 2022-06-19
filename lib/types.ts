export type SelectOptions = {
  limit?: number;
  orderBy?: string;
};

export type RepositoryConventions = {
  idColumn: string;
  idColumnAutoIncrement: boolean;
};

export type PreparedStatement = {
  sql: string;
  values: unknown[];
};


export type ConnectionConventions = RepositoryConventions;
