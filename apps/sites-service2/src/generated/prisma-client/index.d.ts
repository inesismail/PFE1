
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CpoConnection
 * 
 */
export type CpoConnection = $Result.DefaultSelection<Prisma.$CpoConnectionPayload>
/**
 * Model EdfRegion
 * 
 */
export type EdfRegion = $Result.DefaultSelection<Prisma.$EdfRegionPayload>
/**
 * Model Site
 * 
 */
export type Site = $Result.DefaultSelection<Prisma.$SitePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more CpoConnections
 * const cpoConnections = await prisma.cpoConnection.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more CpoConnections
   * const cpoConnections = await prisma.cpoConnection.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.cpoConnection`: Exposes CRUD operations for the **CpoConnection** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CpoConnections
    * const cpoConnections = await prisma.cpoConnection.findMany()
    * ```
    */
  get cpoConnection(): Prisma.CpoConnectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.edfRegion`: Exposes CRUD operations for the **EdfRegion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdfRegions
    * const edfRegions = await prisma.edfRegion.findMany()
    * ```
    */
  get edfRegion(): Prisma.EdfRegionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.site`: Exposes CRUD operations for the **Site** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sites
    * const sites = await prisma.site.findMany()
    * ```
    */
  get site(): Prisma.SiteDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.2
   * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CpoConnection: 'CpoConnection',
    EdfRegion: 'EdfRegion',
    Site: 'Site'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "cpoConnection" | "edfRegion" | "site"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CpoConnection: {
        payload: Prisma.$CpoConnectionPayload<ExtArgs>
        fields: Prisma.CpoConnectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CpoConnectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CpoConnectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          findFirst: {
            args: Prisma.CpoConnectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CpoConnectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          findMany: {
            args: Prisma.CpoConnectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>[]
          }
          create: {
            args: Prisma.CpoConnectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          createMany: {
            args: Prisma.CpoConnectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CpoConnectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>[]
          }
          delete: {
            args: Prisma.CpoConnectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          update: {
            args: Prisma.CpoConnectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          deleteMany: {
            args: Prisma.CpoConnectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CpoConnectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CpoConnectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>[]
          }
          upsert: {
            args: Prisma.CpoConnectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CpoConnectionPayload>
          }
          aggregate: {
            args: Prisma.CpoConnectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCpoConnection>
          }
          groupBy: {
            args: Prisma.CpoConnectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CpoConnectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CpoConnectionCountArgs<ExtArgs>
            result: $Utils.Optional<CpoConnectionCountAggregateOutputType> | number
          }
        }
      }
      EdfRegion: {
        payload: Prisma.$EdfRegionPayload<ExtArgs>
        fields: Prisma.EdfRegionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EdfRegionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EdfRegionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          findFirst: {
            args: Prisma.EdfRegionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EdfRegionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          findMany: {
            args: Prisma.EdfRegionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>[]
          }
          create: {
            args: Prisma.EdfRegionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          createMany: {
            args: Prisma.EdfRegionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EdfRegionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>[]
          }
          delete: {
            args: Prisma.EdfRegionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          update: {
            args: Prisma.EdfRegionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          deleteMany: {
            args: Prisma.EdfRegionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EdfRegionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EdfRegionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>[]
          }
          upsert: {
            args: Prisma.EdfRegionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EdfRegionPayload>
          }
          aggregate: {
            args: Prisma.EdfRegionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEdfRegion>
          }
          groupBy: {
            args: Prisma.EdfRegionGroupByArgs<ExtArgs>
            result: $Utils.Optional<EdfRegionGroupByOutputType>[]
          }
          count: {
            args: Prisma.EdfRegionCountArgs<ExtArgs>
            result: $Utils.Optional<EdfRegionCountAggregateOutputType> | number
          }
        }
      }
      Site: {
        payload: Prisma.$SitePayload<ExtArgs>
        fields: Prisma.SiteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SiteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SiteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          findFirst: {
            args: Prisma.SiteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SiteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          findMany: {
            args: Prisma.SiteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>[]
          }
          create: {
            args: Prisma.SiteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          createMany: {
            args: Prisma.SiteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SiteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>[]
          }
          delete: {
            args: Prisma.SiteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          update: {
            args: Prisma.SiteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          deleteMany: {
            args: Prisma.SiteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SiteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SiteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>[]
          }
          upsert: {
            args: Prisma.SiteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SitePayload>
          }
          aggregate: {
            args: Prisma.SiteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSite>
          }
          groupBy: {
            args: Prisma.SiteGroupByArgs<ExtArgs>
            result: $Utils.Optional<SiteGroupByOutputType>[]
          }
          count: {
            args: Prisma.SiteCountArgs<ExtArgs>
            result: $Utils.Optional<SiteCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    cpoConnection?: CpoConnectionOmit
    edfRegion?: EdfRegionOmit
    site?: SiteOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CpoConnectionCountOutputType
   */

  export type CpoConnectionCountOutputType = {
    sites: number
  }

  export type CpoConnectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sites?: boolean | CpoConnectionCountOutputTypeCountSitesArgs
  }

  // Custom InputTypes
  /**
   * CpoConnectionCountOutputType without action
   */
  export type CpoConnectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnectionCountOutputType
     */
    select?: CpoConnectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CpoConnectionCountOutputType without action
   */
  export type CpoConnectionCountOutputTypeCountSitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SiteWhereInput
  }


  /**
   * Count Type EdfRegionCountOutputType
   */

  export type EdfRegionCountOutputType = {
    sites: number
  }

  export type EdfRegionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sites?: boolean | EdfRegionCountOutputTypeCountSitesArgs
  }

  // Custom InputTypes
  /**
   * EdfRegionCountOutputType without action
   */
  export type EdfRegionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegionCountOutputType
     */
    select?: EdfRegionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EdfRegionCountOutputType without action
   */
  export type EdfRegionCountOutputTypeCountSitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SiteWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CpoConnection
   */

  export type AggregateCpoConnection = {
    _count: CpoConnectionCountAggregateOutputType | null
    _avg: CpoConnectionAvgAggregateOutputType | null
    _sum: CpoConnectionSumAggregateOutputType | null
    _min: CpoConnectionMinAggregateOutputType | null
    _max: CpoConnectionMaxAggregateOutputType | null
  }

  export type CpoConnectionAvgAggregateOutputType = {
    fetchIntervalMinutes: number | null
  }

  export type CpoConnectionSumAggregateOutputType = {
    fetchIntervalMinutes: number | null
  }

  export type CpoConnectionMinAggregateOutputType = {
    id: string | null
    actorId: string | null
    baseUrl: string | null
    authUrl: string | null
    authType: string | null
    email: string | null
    encryptedPassword: string | null
    accessToken: string | null
    refreshToken: string | null
    tokenExpiresAt: Date | null
    isConnected: boolean | null
    fetchIntervalMinutes: number | null
    fetchEnabled: boolean | null
    lastFetchAt: Date | null
    nextFetchAt: Date | null
    lastSyncAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CpoConnectionMaxAggregateOutputType = {
    id: string | null
    actorId: string | null
    baseUrl: string | null
    authUrl: string | null
    authType: string | null
    email: string | null
    encryptedPassword: string | null
    accessToken: string | null
    refreshToken: string | null
    tokenExpiresAt: Date | null
    isConnected: boolean | null
    fetchIntervalMinutes: number | null
    fetchEnabled: boolean | null
    lastFetchAt: Date | null
    nextFetchAt: Date | null
    lastSyncAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CpoConnectionCountAggregateOutputType = {
    id: number
    actorId: number
    baseUrl: number
    authUrl: number
    authType: number
    email: number
    encryptedPassword: number
    accessToken: number
    refreshToken: number
    tokenExpiresAt: number
    isConnected: number
    fetchIntervalMinutes: number
    fetchEnabled: number
    lastFetchAt: number
    nextFetchAt: number
    lastSyncAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CpoConnectionAvgAggregateInputType = {
    fetchIntervalMinutes?: true
  }

  export type CpoConnectionSumAggregateInputType = {
    fetchIntervalMinutes?: true
  }

  export type CpoConnectionMinAggregateInputType = {
    id?: true
    actorId?: true
    baseUrl?: true
    authUrl?: true
    authType?: true
    email?: true
    encryptedPassword?: true
    accessToken?: true
    refreshToken?: true
    tokenExpiresAt?: true
    isConnected?: true
    fetchIntervalMinutes?: true
    fetchEnabled?: true
    lastFetchAt?: true
    nextFetchAt?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CpoConnectionMaxAggregateInputType = {
    id?: true
    actorId?: true
    baseUrl?: true
    authUrl?: true
    authType?: true
    email?: true
    encryptedPassword?: true
    accessToken?: true
    refreshToken?: true
    tokenExpiresAt?: true
    isConnected?: true
    fetchIntervalMinutes?: true
    fetchEnabled?: true
    lastFetchAt?: true
    nextFetchAt?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CpoConnectionCountAggregateInputType = {
    id?: true
    actorId?: true
    baseUrl?: true
    authUrl?: true
    authType?: true
    email?: true
    encryptedPassword?: true
    accessToken?: true
    refreshToken?: true
    tokenExpiresAt?: true
    isConnected?: true
    fetchIntervalMinutes?: true
    fetchEnabled?: true
    lastFetchAt?: true
    nextFetchAt?: true
    lastSyncAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CpoConnectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CpoConnection to aggregate.
     */
    where?: CpoConnectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CpoConnections to fetch.
     */
    orderBy?: CpoConnectionOrderByWithRelationInput | CpoConnectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CpoConnectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CpoConnections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CpoConnections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CpoConnections
    **/
    _count?: true | CpoConnectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CpoConnectionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CpoConnectionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CpoConnectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CpoConnectionMaxAggregateInputType
  }

  export type GetCpoConnectionAggregateType<T extends CpoConnectionAggregateArgs> = {
        [P in keyof T & keyof AggregateCpoConnection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCpoConnection[P]>
      : GetScalarType<T[P], AggregateCpoConnection[P]>
  }




  export type CpoConnectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CpoConnectionWhereInput
    orderBy?: CpoConnectionOrderByWithAggregationInput | CpoConnectionOrderByWithAggregationInput[]
    by: CpoConnectionScalarFieldEnum[] | CpoConnectionScalarFieldEnum
    having?: CpoConnectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CpoConnectionCountAggregateInputType | true
    _avg?: CpoConnectionAvgAggregateInputType
    _sum?: CpoConnectionSumAggregateInputType
    _min?: CpoConnectionMinAggregateInputType
    _max?: CpoConnectionMaxAggregateInputType
  }

  export type CpoConnectionGroupByOutputType = {
    id: string
    actorId: string
    baseUrl: string
    authUrl: string | null
    authType: string
    email: string | null
    encryptedPassword: string | null
    accessToken: string | null
    refreshToken: string | null
    tokenExpiresAt: Date | null
    isConnected: boolean
    fetchIntervalMinutes: number
    fetchEnabled: boolean
    lastFetchAt: Date | null
    nextFetchAt: Date | null
    lastSyncAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: CpoConnectionCountAggregateOutputType | null
    _avg: CpoConnectionAvgAggregateOutputType | null
    _sum: CpoConnectionSumAggregateOutputType | null
    _min: CpoConnectionMinAggregateOutputType | null
    _max: CpoConnectionMaxAggregateOutputType | null
  }

  type GetCpoConnectionGroupByPayload<T extends CpoConnectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CpoConnectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CpoConnectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CpoConnectionGroupByOutputType[P]>
            : GetScalarType<T[P], CpoConnectionGroupByOutputType[P]>
        }
      >
    >


  export type CpoConnectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    actorId?: boolean
    baseUrl?: boolean
    authUrl?: boolean
    authType?: boolean
    email?: boolean
    encryptedPassword?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    tokenExpiresAt?: boolean
    isConnected?: boolean
    fetchIntervalMinutes?: boolean
    fetchEnabled?: boolean
    lastFetchAt?: boolean
    nextFetchAt?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sites?: boolean | CpoConnection$sitesArgs<ExtArgs>
    _count?: boolean | CpoConnectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cpoConnection"]>

  export type CpoConnectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    actorId?: boolean
    baseUrl?: boolean
    authUrl?: boolean
    authType?: boolean
    email?: boolean
    encryptedPassword?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    tokenExpiresAt?: boolean
    isConnected?: boolean
    fetchIntervalMinutes?: boolean
    fetchEnabled?: boolean
    lastFetchAt?: boolean
    nextFetchAt?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cpoConnection"]>

  export type CpoConnectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    actorId?: boolean
    baseUrl?: boolean
    authUrl?: boolean
    authType?: boolean
    email?: boolean
    encryptedPassword?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    tokenExpiresAt?: boolean
    isConnected?: boolean
    fetchIntervalMinutes?: boolean
    fetchEnabled?: boolean
    lastFetchAt?: boolean
    nextFetchAt?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cpoConnection"]>

  export type CpoConnectionSelectScalar = {
    id?: boolean
    actorId?: boolean
    baseUrl?: boolean
    authUrl?: boolean
    authType?: boolean
    email?: boolean
    encryptedPassword?: boolean
    accessToken?: boolean
    refreshToken?: boolean
    tokenExpiresAt?: boolean
    isConnected?: boolean
    fetchIntervalMinutes?: boolean
    fetchEnabled?: boolean
    lastFetchAt?: boolean
    nextFetchAt?: boolean
    lastSyncAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CpoConnectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "actorId" | "baseUrl" | "authUrl" | "authType" | "email" | "encryptedPassword" | "accessToken" | "refreshToken" | "tokenExpiresAt" | "isConnected" | "fetchIntervalMinutes" | "fetchEnabled" | "lastFetchAt" | "nextFetchAt" | "lastSyncAt" | "createdAt" | "updatedAt", ExtArgs["result"]["cpoConnection"]>
  export type CpoConnectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sites?: boolean | CpoConnection$sitesArgs<ExtArgs>
    _count?: boolean | CpoConnectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CpoConnectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CpoConnectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CpoConnectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CpoConnection"
    objects: {
      sites: Prisma.$SitePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      actorId: string
      baseUrl: string
      authUrl: string | null
      authType: string
      email: string | null
      encryptedPassword: string | null
      accessToken: string | null
      refreshToken: string | null
      tokenExpiresAt: Date | null
      isConnected: boolean
      fetchIntervalMinutes: number
      fetchEnabled: boolean
      lastFetchAt: Date | null
      nextFetchAt: Date | null
      lastSyncAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cpoConnection"]>
    composites: {}
  }

  type CpoConnectionGetPayload<S extends boolean | null | undefined | CpoConnectionDefaultArgs> = $Result.GetResult<Prisma.$CpoConnectionPayload, S>

  type CpoConnectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CpoConnectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CpoConnectionCountAggregateInputType | true
    }

  export interface CpoConnectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CpoConnection'], meta: { name: 'CpoConnection' } }
    /**
     * Find zero or one CpoConnection that matches the filter.
     * @param {CpoConnectionFindUniqueArgs} args - Arguments to find a CpoConnection
     * @example
     * // Get one CpoConnection
     * const cpoConnection = await prisma.cpoConnection.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CpoConnectionFindUniqueArgs>(args: SelectSubset<T, CpoConnectionFindUniqueArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CpoConnection that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CpoConnectionFindUniqueOrThrowArgs} args - Arguments to find a CpoConnection
     * @example
     * // Get one CpoConnection
     * const cpoConnection = await prisma.cpoConnection.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CpoConnectionFindUniqueOrThrowArgs>(args: SelectSubset<T, CpoConnectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CpoConnection that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionFindFirstArgs} args - Arguments to find a CpoConnection
     * @example
     * // Get one CpoConnection
     * const cpoConnection = await prisma.cpoConnection.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CpoConnectionFindFirstArgs>(args?: SelectSubset<T, CpoConnectionFindFirstArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CpoConnection that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionFindFirstOrThrowArgs} args - Arguments to find a CpoConnection
     * @example
     * // Get one CpoConnection
     * const cpoConnection = await prisma.cpoConnection.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CpoConnectionFindFirstOrThrowArgs>(args?: SelectSubset<T, CpoConnectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CpoConnections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CpoConnections
     * const cpoConnections = await prisma.cpoConnection.findMany()
     * 
     * // Get first 10 CpoConnections
     * const cpoConnections = await prisma.cpoConnection.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cpoConnectionWithIdOnly = await prisma.cpoConnection.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CpoConnectionFindManyArgs>(args?: SelectSubset<T, CpoConnectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CpoConnection.
     * @param {CpoConnectionCreateArgs} args - Arguments to create a CpoConnection.
     * @example
     * // Create one CpoConnection
     * const CpoConnection = await prisma.cpoConnection.create({
     *   data: {
     *     // ... data to create a CpoConnection
     *   }
     * })
     * 
     */
    create<T extends CpoConnectionCreateArgs>(args: SelectSubset<T, CpoConnectionCreateArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CpoConnections.
     * @param {CpoConnectionCreateManyArgs} args - Arguments to create many CpoConnections.
     * @example
     * // Create many CpoConnections
     * const cpoConnection = await prisma.cpoConnection.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CpoConnectionCreateManyArgs>(args?: SelectSubset<T, CpoConnectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CpoConnections and returns the data saved in the database.
     * @param {CpoConnectionCreateManyAndReturnArgs} args - Arguments to create many CpoConnections.
     * @example
     * // Create many CpoConnections
     * const cpoConnection = await prisma.cpoConnection.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CpoConnections and only return the `id`
     * const cpoConnectionWithIdOnly = await prisma.cpoConnection.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CpoConnectionCreateManyAndReturnArgs>(args?: SelectSubset<T, CpoConnectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CpoConnection.
     * @param {CpoConnectionDeleteArgs} args - Arguments to delete one CpoConnection.
     * @example
     * // Delete one CpoConnection
     * const CpoConnection = await prisma.cpoConnection.delete({
     *   where: {
     *     // ... filter to delete one CpoConnection
     *   }
     * })
     * 
     */
    delete<T extends CpoConnectionDeleteArgs>(args: SelectSubset<T, CpoConnectionDeleteArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CpoConnection.
     * @param {CpoConnectionUpdateArgs} args - Arguments to update one CpoConnection.
     * @example
     * // Update one CpoConnection
     * const cpoConnection = await prisma.cpoConnection.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CpoConnectionUpdateArgs>(args: SelectSubset<T, CpoConnectionUpdateArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CpoConnections.
     * @param {CpoConnectionDeleteManyArgs} args - Arguments to filter CpoConnections to delete.
     * @example
     * // Delete a few CpoConnections
     * const { count } = await prisma.cpoConnection.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CpoConnectionDeleteManyArgs>(args?: SelectSubset<T, CpoConnectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CpoConnections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CpoConnections
     * const cpoConnection = await prisma.cpoConnection.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CpoConnectionUpdateManyArgs>(args: SelectSubset<T, CpoConnectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CpoConnections and returns the data updated in the database.
     * @param {CpoConnectionUpdateManyAndReturnArgs} args - Arguments to update many CpoConnections.
     * @example
     * // Update many CpoConnections
     * const cpoConnection = await prisma.cpoConnection.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CpoConnections and only return the `id`
     * const cpoConnectionWithIdOnly = await prisma.cpoConnection.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CpoConnectionUpdateManyAndReturnArgs>(args: SelectSubset<T, CpoConnectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CpoConnection.
     * @param {CpoConnectionUpsertArgs} args - Arguments to update or create a CpoConnection.
     * @example
     * // Update or create a CpoConnection
     * const cpoConnection = await prisma.cpoConnection.upsert({
     *   create: {
     *     // ... data to create a CpoConnection
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CpoConnection we want to update
     *   }
     * })
     */
    upsert<T extends CpoConnectionUpsertArgs>(args: SelectSubset<T, CpoConnectionUpsertArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CpoConnections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionCountArgs} args - Arguments to filter CpoConnections to count.
     * @example
     * // Count the number of CpoConnections
     * const count = await prisma.cpoConnection.count({
     *   where: {
     *     // ... the filter for the CpoConnections we want to count
     *   }
     * })
    **/
    count<T extends CpoConnectionCountArgs>(
      args?: Subset<T, CpoConnectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CpoConnectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CpoConnection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CpoConnectionAggregateArgs>(args: Subset<T, CpoConnectionAggregateArgs>): Prisma.PrismaPromise<GetCpoConnectionAggregateType<T>>

    /**
     * Group by CpoConnection.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpoConnectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CpoConnectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CpoConnectionGroupByArgs['orderBy'] }
        : { orderBy?: CpoConnectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CpoConnectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCpoConnectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CpoConnection model
   */
  readonly fields: CpoConnectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CpoConnection.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CpoConnectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sites<T extends CpoConnection$sitesArgs<ExtArgs> = {}>(args?: Subset<T, CpoConnection$sitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CpoConnection model
   */
  interface CpoConnectionFieldRefs {
    readonly id: FieldRef<"CpoConnection", 'String'>
    readonly actorId: FieldRef<"CpoConnection", 'String'>
    readonly baseUrl: FieldRef<"CpoConnection", 'String'>
    readonly authUrl: FieldRef<"CpoConnection", 'String'>
    readonly authType: FieldRef<"CpoConnection", 'String'>
    readonly email: FieldRef<"CpoConnection", 'String'>
    readonly encryptedPassword: FieldRef<"CpoConnection", 'String'>
    readonly accessToken: FieldRef<"CpoConnection", 'String'>
    readonly refreshToken: FieldRef<"CpoConnection", 'String'>
    readonly tokenExpiresAt: FieldRef<"CpoConnection", 'DateTime'>
    readonly isConnected: FieldRef<"CpoConnection", 'Boolean'>
    readonly fetchIntervalMinutes: FieldRef<"CpoConnection", 'Int'>
    readonly fetchEnabled: FieldRef<"CpoConnection", 'Boolean'>
    readonly lastFetchAt: FieldRef<"CpoConnection", 'DateTime'>
    readonly nextFetchAt: FieldRef<"CpoConnection", 'DateTime'>
    readonly lastSyncAt: FieldRef<"CpoConnection", 'DateTime'>
    readonly createdAt: FieldRef<"CpoConnection", 'DateTime'>
    readonly updatedAt: FieldRef<"CpoConnection", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CpoConnection findUnique
   */
  export type CpoConnectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter, which CpoConnection to fetch.
     */
    where: CpoConnectionWhereUniqueInput
  }

  /**
   * CpoConnection findUniqueOrThrow
   */
  export type CpoConnectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter, which CpoConnection to fetch.
     */
    where: CpoConnectionWhereUniqueInput
  }

  /**
   * CpoConnection findFirst
   */
  export type CpoConnectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter, which CpoConnection to fetch.
     */
    where?: CpoConnectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CpoConnections to fetch.
     */
    orderBy?: CpoConnectionOrderByWithRelationInput | CpoConnectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CpoConnections.
     */
    cursor?: CpoConnectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CpoConnections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CpoConnections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CpoConnections.
     */
    distinct?: CpoConnectionScalarFieldEnum | CpoConnectionScalarFieldEnum[]
  }

  /**
   * CpoConnection findFirstOrThrow
   */
  export type CpoConnectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter, which CpoConnection to fetch.
     */
    where?: CpoConnectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CpoConnections to fetch.
     */
    orderBy?: CpoConnectionOrderByWithRelationInput | CpoConnectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CpoConnections.
     */
    cursor?: CpoConnectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CpoConnections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CpoConnections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CpoConnections.
     */
    distinct?: CpoConnectionScalarFieldEnum | CpoConnectionScalarFieldEnum[]
  }

  /**
   * CpoConnection findMany
   */
  export type CpoConnectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter, which CpoConnections to fetch.
     */
    where?: CpoConnectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CpoConnections to fetch.
     */
    orderBy?: CpoConnectionOrderByWithRelationInput | CpoConnectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CpoConnections.
     */
    cursor?: CpoConnectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CpoConnections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CpoConnections.
     */
    skip?: number
    distinct?: CpoConnectionScalarFieldEnum | CpoConnectionScalarFieldEnum[]
  }

  /**
   * CpoConnection create
   */
  export type CpoConnectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * The data needed to create a CpoConnection.
     */
    data: XOR<CpoConnectionCreateInput, CpoConnectionUncheckedCreateInput>
  }

  /**
   * CpoConnection createMany
   */
  export type CpoConnectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CpoConnections.
     */
    data: CpoConnectionCreateManyInput | CpoConnectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CpoConnection createManyAndReturn
   */
  export type CpoConnectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * The data used to create many CpoConnections.
     */
    data: CpoConnectionCreateManyInput | CpoConnectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CpoConnection update
   */
  export type CpoConnectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * The data needed to update a CpoConnection.
     */
    data: XOR<CpoConnectionUpdateInput, CpoConnectionUncheckedUpdateInput>
    /**
     * Choose, which CpoConnection to update.
     */
    where: CpoConnectionWhereUniqueInput
  }

  /**
   * CpoConnection updateMany
   */
  export type CpoConnectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CpoConnections.
     */
    data: XOR<CpoConnectionUpdateManyMutationInput, CpoConnectionUncheckedUpdateManyInput>
    /**
     * Filter which CpoConnections to update
     */
    where?: CpoConnectionWhereInput
    /**
     * Limit how many CpoConnections to update.
     */
    limit?: number
  }

  /**
   * CpoConnection updateManyAndReturn
   */
  export type CpoConnectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * The data used to update CpoConnections.
     */
    data: XOR<CpoConnectionUpdateManyMutationInput, CpoConnectionUncheckedUpdateManyInput>
    /**
     * Filter which CpoConnections to update
     */
    where?: CpoConnectionWhereInput
    /**
     * Limit how many CpoConnections to update.
     */
    limit?: number
  }

  /**
   * CpoConnection upsert
   */
  export type CpoConnectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * The filter to search for the CpoConnection to update in case it exists.
     */
    where: CpoConnectionWhereUniqueInput
    /**
     * In case the CpoConnection found by the `where` argument doesn't exist, create a new CpoConnection with this data.
     */
    create: XOR<CpoConnectionCreateInput, CpoConnectionUncheckedCreateInput>
    /**
     * In case the CpoConnection was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CpoConnectionUpdateInput, CpoConnectionUncheckedUpdateInput>
  }

  /**
   * CpoConnection delete
   */
  export type CpoConnectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
    /**
     * Filter which CpoConnection to delete.
     */
    where: CpoConnectionWhereUniqueInput
  }

  /**
   * CpoConnection deleteMany
   */
  export type CpoConnectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CpoConnections to delete
     */
    where?: CpoConnectionWhereInput
    /**
     * Limit how many CpoConnections to delete.
     */
    limit?: number
  }

  /**
   * CpoConnection.sites
   */
  export type CpoConnection$sitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    where?: SiteWhereInput
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    cursor?: SiteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SiteScalarFieldEnum | SiteScalarFieldEnum[]
  }

  /**
   * CpoConnection without action
   */
  export type CpoConnectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CpoConnection
     */
    select?: CpoConnectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CpoConnection
     */
    omit?: CpoConnectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CpoConnectionInclude<ExtArgs> | null
  }


  /**
   * Model EdfRegion
   */

  export type AggregateEdfRegion = {
    _count: EdfRegionCountAggregateOutputType | null
    _min: EdfRegionMinAggregateOutputType | null
    _max: EdfRegionMaxAggregateOutputType | null
  }

  export type EdfRegionMinAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    apiEndpoint: string | null
    datasetId: string | null
    apiKey: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EdfRegionMaxAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    apiEndpoint: string | null
    datasetId: string | null
    apiKey: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EdfRegionCountAggregateOutputType = {
    id: number
    code: number
    name: number
    apiEndpoint: number
    datasetId: number
    apiKey: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EdfRegionMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    apiEndpoint?: true
    datasetId?: true
    apiKey?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EdfRegionMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    apiEndpoint?: true
    datasetId?: true
    apiKey?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EdfRegionCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    apiEndpoint?: true
    datasetId?: true
    apiKey?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EdfRegionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EdfRegion to aggregate.
     */
    where?: EdfRegionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EdfRegions to fetch.
     */
    orderBy?: EdfRegionOrderByWithRelationInput | EdfRegionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EdfRegionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EdfRegions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EdfRegions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EdfRegions
    **/
    _count?: true | EdfRegionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdfRegionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdfRegionMaxAggregateInputType
  }

  export type GetEdfRegionAggregateType<T extends EdfRegionAggregateArgs> = {
        [P in keyof T & keyof AggregateEdfRegion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdfRegion[P]>
      : GetScalarType<T[P], AggregateEdfRegion[P]>
  }




  export type EdfRegionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EdfRegionWhereInput
    orderBy?: EdfRegionOrderByWithAggregationInput | EdfRegionOrderByWithAggregationInput[]
    by: EdfRegionScalarFieldEnum[] | EdfRegionScalarFieldEnum
    having?: EdfRegionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdfRegionCountAggregateInputType | true
    _min?: EdfRegionMinAggregateInputType
    _max?: EdfRegionMaxAggregateInputType
  }

  export type EdfRegionGroupByOutputType = {
    id: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: EdfRegionCountAggregateOutputType | null
    _min: EdfRegionMinAggregateOutputType | null
    _max: EdfRegionMaxAggregateOutputType | null
  }

  type GetEdfRegionGroupByPayload<T extends EdfRegionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdfRegionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdfRegionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdfRegionGroupByOutputType[P]>
            : GetScalarType<T[P], EdfRegionGroupByOutputType[P]>
        }
      >
    >


  export type EdfRegionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    apiEndpoint?: boolean
    datasetId?: boolean
    apiKey?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sites?: boolean | EdfRegion$sitesArgs<ExtArgs>
    _count?: boolean | EdfRegionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["edfRegion"]>

  export type EdfRegionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    apiEndpoint?: boolean
    datasetId?: boolean
    apiKey?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["edfRegion"]>

  export type EdfRegionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    apiEndpoint?: boolean
    datasetId?: boolean
    apiKey?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["edfRegion"]>

  export type EdfRegionSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    apiEndpoint?: boolean
    datasetId?: boolean
    apiKey?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EdfRegionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "apiEndpoint" | "datasetId" | "apiKey" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["edfRegion"]>
  export type EdfRegionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sites?: boolean | EdfRegion$sitesArgs<ExtArgs>
    _count?: boolean | EdfRegionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EdfRegionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type EdfRegionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EdfRegionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EdfRegion"
    objects: {
      sites: Prisma.$SitePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      name: string
      apiEndpoint: string
      datasetId: string
      apiKey: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["edfRegion"]>
    composites: {}
  }

  type EdfRegionGetPayload<S extends boolean | null | undefined | EdfRegionDefaultArgs> = $Result.GetResult<Prisma.$EdfRegionPayload, S>

  type EdfRegionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EdfRegionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EdfRegionCountAggregateInputType | true
    }

  export interface EdfRegionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EdfRegion'], meta: { name: 'EdfRegion' } }
    /**
     * Find zero or one EdfRegion that matches the filter.
     * @param {EdfRegionFindUniqueArgs} args - Arguments to find a EdfRegion
     * @example
     * // Get one EdfRegion
     * const edfRegion = await prisma.edfRegion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EdfRegionFindUniqueArgs>(args: SelectSubset<T, EdfRegionFindUniqueArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EdfRegion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EdfRegionFindUniqueOrThrowArgs} args - Arguments to find a EdfRegion
     * @example
     * // Get one EdfRegion
     * const edfRegion = await prisma.edfRegion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EdfRegionFindUniqueOrThrowArgs>(args: SelectSubset<T, EdfRegionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EdfRegion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionFindFirstArgs} args - Arguments to find a EdfRegion
     * @example
     * // Get one EdfRegion
     * const edfRegion = await prisma.edfRegion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EdfRegionFindFirstArgs>(args?: SelectSubset<T, EdfRegionFindFirstArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EdfRegion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionFindFirstOrThrowArgs} args - Arguments to find a EdfRegion
     * @example
     * // Get one EdfRegion
     * const edfRegion = await prisma.edfRegion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EdfRegionFindFirstOrThrowArgs>(args?: SelectSubset<T, EdfRegionFindFirstOrThrowArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EdfRegions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdfRegions
     * const edfRegions = await prisma.edfRegion.findMany()
     * 
     * // Get first 10 EdfRegions
     * const edfRegions = await prisma.edfRegion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edfRegionWithIdOnly = await prisma.edfRegion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EdfRegionFindManyArgs>(args?: SelectSubset<T, EdfRegionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EdfRegion.
     * @param {EdfRegionCreateArgs} args - Arguments to create a EdfRegion.
     * @example
     * // Create one EdfRegion
     * const EdfRegion = await prisma.edfRegion.create({
     *   data: {
     *     // ... data to create a EdfRegion
     *   }
     * })
     * 
     */
    create<T extends EdfRegionCreateArgs>(args: SelectSubset<T, EdfRegionCreateArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EdfRegions.
     * @param {EdfRegionCreateManyArgs} args - Arguments to create many EdfRegions.
     * @example
     * // Create many EdfRegions
     * const edfRegion = await prisma.edfRegion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EdfRegionCreateManyArgs>(args?: SelectSubset<T, EdfRegionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EdfRegions and returns the data saved in the database.
     * @param {EdfRegionCreateManyAndReturnArgs} args - Arguments to create many EdfRegions.
     * @example
     * // Create many EdfRegions
     * const edfRegion = await prisma.edfRegion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EdfRegions and only return the `id`
     * const edfRegionWithIdOnly = await prisma.edfRegion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EdfRegionCreateManyAndReturnArgs>(args?: SelectSubset<T, EdfRegionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EdfRegion.
     * @param {EdfRegionDeleteArgs} args - Arguments to delete one EdfRegion.
     * @example
     * // Delete one EdfRegion
     * const EdfRegion = await prisma.edfRegion.delete({
     *   where: {
     *     // ... filter to delete one EdfRegion
     *   }
     * })
     * 
     */
    delete<T extends EdfRegionDeleteArgs>(args: SelectSubset<T, EdfRegionDeleteArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EdfRegion.
     * @param {EdfRegionUpdateArgs} args - Arguments to update one EdfRegion.
     * @example
     * // Update one EdfRegion
     * const edfRegion = await prisma.edfRegion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EdfRegionUpdateArgs>(args: SelectSubset<T, EdfRegionUpdateArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EdfRegions.
     * @param {EdfRegionDeleteManyArgs} args - Arguments to filter EdfRegions to delete.
     * @example
     * // Delete a few EdfRegions
     * const { count } = await prisma.edfRegion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EdfRegionDeleteManyArgs>(args?: SelectSubset<T, EdfRegionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdfRegions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdfRegions
     * const edfRegion = await prisma.edfRegion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EdfRegionUpdateManyArgs>(args: SelectSubset<T, EdfRegionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdfRegions and returns the data updated in the database.
     * @param {EdfRegionUpdateManyAndReturnArgs} args - Arguments to update many EdfRegions.
     * @example
     * // Update many EdfRegions
     * const edfRegion = await prisma.edfRegion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EdfRegions and only return the `id`
     * const edfRegionWithIdOnly = await prisma.edfRegion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EdfRegionUpdateManyAndReturnArgs>(args: SelectSubset<T, EdfRegionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EdfRegion.
     * @param {EdfRegionUpsertArgs} args - Arguments to update or create a EdfRegion.
     * @example
     * // Update or create a EdfRegion
     * const edfRegion = await prisma.edfRegion.upsert({
     *   create: {
     *     // ... data to create a EdfRegion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdfRegion we want to update
     *   }
     * })
     */
    upsert<T extends EdfRegionUpsertArgs>(args: SelectSubset<T, EdfRegionUpsertArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EdfRegions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionCountArgs} args - Arguments to filter EdfRegions to count.
     * @example
     * // Count the number of EdfRegions
     * const count = await prisma.edfRegion.count({
     *   where: {
     *     // ... the filter for the EdfRegions we want to count
     *   }
     * })
    **/
    count<T extends EdfRegionCountArgs>(
      args?: Subset<T, EdfRegionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdfRegionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdfRegion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EdfRegionAggregateArgs>(args: Subset<T, EdfRegionAggregateArgs>): Prisma.PrismaPromise<GetEdfRegionAggregateType<T>>

    /**
     * Group by EdfRegion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdfRegionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EdfRegionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EdfRegionGroupByArgs['orderBy'] }
        : { orderBy?: EdfRegionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EdfRegionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdfRegionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EdfRegion model
   */
  readonly fields: EdfRegionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EdfRegion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EdfRegionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sites<T extends EdfRegion$sitesArgs<ExtArgs> = {}>(args?: Subset<T, EdfRegion$sitesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EdfRegion model
   */
  interface EdfRegionFieldRefs {
    readonly id: FieldRef<"EdfRegion", 'String'>
    readonly code: FieldRef<"EdfRegion", 'String'>
    readonly name: FieldRef<"EdfRegion", 'String'>
    readonly apiEndpoint: FieldRef<"EdfRegion", 'String'>
    readonly datasetId: FieldRef<"EdfRegion", 'String'>
    readonly apiKey: FieldRef<"EdfRegion", 'String'>
    readonly isActive: FieldRef<"EdfRegion", 'Boolean'>
    readonly createdAt: FieldRef<"EdfRegion", 'DateTime'>
    readonly updatedAt: FieldRef<"EdfRegion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EdfRegion findUnique
   */
  export type EdfRegionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter, which EdfRegion to fetch.
     */
    where: EdfRegionWhereUniqueInput
  }

  /**
   * EdfRegion findUniqueOrThrow
   */
  export type EdfRegionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter, which EdfRegion to fetch.
     */
    where: EdfRegionWhereUniqueInput
  }

  /**
   * EdfRegion findFirst
   */
  export type EdfRegionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter, which EdfRegion to fetch.
     */
    where?: EdfRegionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EdfRegions to fetch.
     */
    orderBy?: EdfRegionOrderByWithRelationInput | EdfRegionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EdfRegions.
     */
    cursor?: EdfRegionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EdfRegions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EdfRegions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EdfRegions.
     */
    distinct?: EdfRegionScalarFieldEnum | EdfRegionScalarFieldEnum[]
  }

  /**
   * EdfRegion findFirstOrThrow
   */
  export type EdfRegionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter, which EdfRegion to fetch.
     */
    where?: EdfRegionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EdfRegions to fetch.
     */
    orderBy?: EdfRegionOrderByWithRelationInput | EdfRegionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EdfRegions.
     */
    cursor?: EdfRegionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EdfRegions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EdfRegions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EdfRegions.
     */
    distinct?: EdfRegionScalarFieldEnum | EdfRegionScalarFieldEnum[]
  }

  /**
   * EdfRegion findMany
   */
  export type EdfRegionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter, which EdfRegions to fetch.
     */
    where?: EdfRegionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EdfRegions to fetch.
     */
    orderBy?: EdfRegionOrderByWithRelationInput | EdfRegionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EdfRegions.
     */
    cursor?: EdfRegionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EdfRegions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EdfRegions.
     */
    skip?: number
    distinct?: EdfRegionScalarFieldEnum | EdfRegionScalarFieldEnum[]
  }

  /**
   * EdfRegion create
   */
  export type EdfRegionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * The data needed to create a EdfRegion.
     */
    data: XOR<EdfRegionCreateInput, EdfRegionUncheckedCreateInput>
  }

  /**
   * EdfRegion createMany
   */
  export type EdfRegionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EdfRegions.
     */
    data: EdfRegionCreateManyInput | EdfRegionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EdfRegion createManyAndReturn
   */
  export type EdfRegionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * The data used to create many EdfRegions.
     */
    data: EdfRegionCreateManyInput | EdfRegionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EdfRegion update
   */
  export type EdfRegionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * The data needed to update a EdfRegion.
     */
    data: XOR<EdfRegionUpdateInput, EdfRegionUncheckedUpdateInput>
    /**
     * Choose, which EdfRegion to update.
     */
    where: EdfRegionWhereUniqueInput
  }

  /**
   * EdfRegion updateMany
   */
  export type EdfRegionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EdfRegions.
     */
    data: XOR<EdfRegionUpdateManyMutationInput, EdfRegionUncheckedUpdateManyInput>
    /**
     * Filter which EdfRegions to update
     */
    where?: EdfRegionWhereInput
    /**
     * Limit how many EdfRegions to update.
     */
    limit?: number
  }

  /**
   * EdfRegion updateManyAndReturn
   */
  export type EdfRegionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * The data used to update EdfRegions.
     */
    data: XOR<EdfRegionUpdateManyMutationInput, EdfRegionUncheckedUpdateManyInput>
    /**
     * Filter which EdfRegions to update
     */
    where?: EdfRegionWhereInput
    /**
     * Limit how many EdfRegions to update.
     */
    limit?: number
  }

  /**
   * EdfRegion upsert
   */
  export type EdfRegionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * The filter to search for the EdfRegion to update in case it exists.
     */
    where: EdfRegionWhereUniqueInput
    /**
     * In case the EdfRegion found by the `where` argument doesn't exist, create a new EdfRegion with this data.
     */
    create: XOR<EdfRegionCreateInput, EdfRegionUncheckedCreateInput>
    /**
     * In case the EdfRegion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EdfRegionUpdateInput, EdfRegionUncheckedUpdateInput>
  }

  /**
   * EdfRegion delete
   */
  export type EdfRegionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    /**
     * Filter which EdfRegion to delete.
     */
    where: EdfRegionWhereUniqueInput
  }

  /**
   * EdfRegion deleteMany
   */
  export type EdfRegionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EdfRegions to delete
     */
    where?: EdfRegionWhereInput
    /**
     * Limit how many EdfRegions to delete.
     */
    limit?: number
  }

  /**
   * EdfRegion.sites
   */
  export type EdfRegion$sitesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    where?: SiteWhereInput
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    cursor?: SiteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SiteScalarFieldEnum | SiteScalarFieldEnum[]
  }

  /**
   * EdfRegion without action
   */
  export type EdfRegionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
  }


  /**
   * Model Site
   */

  export type AggregateSite = {
    _count: SiteCountAggregateOutputType | null
    _avg: SiteAvgAggregateOutputType | null
    _sum: SiteSumAggregateOutputType | null
    _min: SiteMinAggregateOutputType | null
    _max: SiteMaxAggregateOutputType | null
  }

  export type SiteAvgAggregateOutputType = {
    maxCapacityKw: number | null
    currentLimitKw: number | null
    reducedLimitKw: number | null
    manualOverrideLimitKw: number | null
    lastSignalValue: number | null
  }

  export type SiteSumAggregateOutputType = {
    maxCapacityKw: number | null
    currentLimitKw: number | null
    reducedLimitKw: number | null
    manualOverrideLimitKw: number | null
    lastSignalValue: number | null
  }

  export type SiteMinAggregateOutputType = {
    id: string | null
    cpoConnectionId: string | null
    externalId: string | null
    name: string | null
    address: string | null
    edfRegionId: string | null
    maxCapacityKw: number | null
    currentLimitKw: number | null
    reducedLimitKw: number | null
    manualOverrideLimitKw: number | null
    manualOverrideUntil: Date | null
    manualOverrideReason: string | null
    isActive: boolean | null
    lastSignalValue: number | null
    lastSignalAt: Date | null
    lastLimitSetAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SiteMaxAggregateOutputType = {
    id: string | null
    cpoConnectionId: string | null
    externalId: string | null
    name: string | null
    address: string | null
    edfRegionId: string | null
    maxCapacityKw: number | null
    currentLimitKw: number | null
    reducedLimitKw: number | null
    manualOverrideLimitKw: number | null
    manualOverrideUntil: Date | null
    manualOverrideReason: string | null
    isActive: boolean | null
    lastSignalValue: number | null
    lastSignalAt: Date | null
    lastLimitSetAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SiteCountAggregateOutputType = {
    id: number
    cpoConnectionId: number
    externalId: number
    name: number
    address: number
    edfRegionId: number
    maxCapacityKw: number
    currentLimitKw: number
    reducedLimitKw: number
    manualOverrideLimitKw: number
    manualOverrideUntil: number
    manualOverrideReason: number
    isActive: number
    lastSignalValue: number
    lastSignalAt: number
    lastLimitSetAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SiteAvgAggregateInputType = {
    maxCapacityKw?: true
    currentLimitKw?: true
    reducedLimitKw?: true
    manualOverrideLimitKw?: true
    lastSignalValue?: true
  }

  export type SiteSumAggregateInputType = {
    maxCapacityKw?: true
    currentLimitKw?: true
    reducedLimitKw?: true
    manualOverrideLimitKw?: true
    lastSignalValue?: true
  }

  export type SiteMinAggregateInputType = {
    id?: true
    cpoConnectionId?: true
    externalId?: true
    name?: true
    address?: true
    edfRegionId?: true
    maxCapacityKw?: true
    currentLimitKw?: true
    reducedLimitKw?: true
    manualOverrideLimitKw?: true
    manualOverrideUntil?: true
    manualOverrideReason?: true
    isActive?: true
    lastSignalValue?: true
    lastSignalAt?: true
    lastLimitSetAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SiteMaxAggregateInputType = {
    id?: true
    cpoConnectionId?: true
    externalId?: true
    name?: true
    address?: true
    edfRegionId?: true
    maxCapacityKw?: true
    currentLimitKw?: true
    reducedLimitKw?: true
    manualOverrideLimitKw?: true
    manualOverrideUntil?: true
    manualOverrideReason?: true
    isActive?: true
    lastSignalValue?: true
    lastSignalAt?: true
    lastLimitSetAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SiteCountAggregateInputType = {
    id?: true
    cpoConnectionId?: true
    externalId?: true
    name?: true
    address?: true
    edfRegionId?: true
    maxCapacityKw?: true
    currentLimitKw?: true
    reducedLimitKw?: true
    manualOverrideLimitKw?: true
    manualOverrideUntil?: true
    manualOverrideReason?: true
    isActive?: true
    lastSignalValue?: true
    lastSignalAt?: true
    lastLimitSetAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SiteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Site to aggregate.
     */
    where?: SiteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sites to fetch.
     */
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SiteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sites
    **/
    _count?: true | SiteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SiteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SiteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SiteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SiteMaxAggregateInputType
  }

  export type GetSiteAggregateType<T extends SiteAggregateArgs> = {
        [P in keyof T & keyof AggregateSite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSite[P]>
      : GetScalarType<T[P], AggregateSite[P]>
  }




  export type SiteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SiteWhereInput
    orderBy?: SiteOrderByWithAggregationInput | SiteOrderByWithAggregationInput[]
    by: SiteScalarFieldEnum[] | SiteScalarFieldEnum
    having?: SiteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SiteCountAggregateInputType | true
    _avg?: SiteAvgAggregateInputType
    _sum?: SiteSumAggregateInputType
    _min?: SiteMinAggregateInputType
    _max?: SiteMaxAggregateInputType
  }

  export type SiteGroupByOutputType = {
    id: string
    cpoConnectionId: string
    externalId: string
    name: string
    address: string | null
    edfRegionId: string | null
    maxCapacityKw: number | null
    currentLimitKw: number | null
    reducedLimitKw: number | null
    manualOverrideLimitKw: number | null
    manualOverrideUntil: Date | null
    manualOverrideReason: string | null
    isActive: boolean
    lastSignalValue: number | null
    lastSignalAt: Date | null
    lastLimitSetAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: SiteCountAggregateOutputType | null
    _avg: SiteAvgAggregateOutputType | null
    _sum: SiteSumAggregateOutputType | null
    _min: SiteMinAggregateOutputType | null
    _max: SiteMaxAggregateOutputType | null
  }

  type GetSiteGroupByPayload<T extends SiteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SiteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SiteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SiteGroupByOutputType[P]>
            : GetScalarType<T[P], SiteGroupByOutputType[P]>
        }
      >
    >


  export type SiteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpoConnectionId?: boolean
    externalId?: boolean
    name?: boolean
    address?: boolean
    edfRegionId?: boolean
    maxCapacityKw?: boolean
    currentLimitKw?: boolean
    reducedLimitKw?: boolean
    manualOverrideLimitKw?: boolean
    manualOverrideUntil?: boolean
    manualOverrideReason?: boolean
    isActive?: boolean
    lastSignalValue?: boolean
    lastSignalAt?: boolean
    lastLimitSetAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }, ExtArgs["result"]["site"]>

  export type SiteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpoConnectionId?: boolean
    externalId?: boolean
    name?: boolean
    address?: boolean
    edfRegionId?: boolean
    maxCapacityKw?: boolean
    currentLimitKw?: boolean
    reducedLimitKw?: boolean
    manualOverrideLimitKw?: boolean
    manualOverrideUntil?: boolean
    manualOverrideReason?: boolean
    isActive?: boolean
    lastSignalValue?: boolean
    lastSignalAt?: boolean
    lastLimitSetAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }, ExtArgs["result"]["site"]>

  export type SiteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpoConnectionId?: boolean
    externalId?: boolean
    name?: boolean
    address?: boolean
    edfRegionId?: boolean
    maxCapacityKw?: boolean
    currentLimitKw?: boolean
    reducedLimitKw?: boolean
    manualOverrideLimitKw?: boolean
    manualOverrideUntil?: boolean
    manualOverrideReason?: boolean
    isActive?: boolean
    lastSignalValue?: boolean
    lastSignalAt?: boolean
    lastLimitSetAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }, ExtArgs["result"]["site"]>

  export type SiteSelectScalar = {
    id?: boolean
    cpoConnectionId?: boolean
    externalId?: boolean
    name?: boolean
    address?: boolean
    edfRegionId?: boolean
    maxCapacityKw?: boolean
    currentLimitKw?: boolean
    reducedLimitKw?: boolean
    manualOverrideLimitKw?: boolean
    manualOverrideUntil?: boolean
    manualOverrideReason?: boolean
    isActive?: boolean
    lastSignalValue?: boolean
    lastSignalAt?: boolean
    lastLimitSetAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SiteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cpoConnectionId" | "externalId" | "name" | "address" | "edfRegionId" | "maxCapacityKw" | "currentLimitKw" | "reducedLimitKw" | "manualOverrideLimitKw" | "manualOverrideUntil" | "manualOverrideReason" | "isActive" | "lastSignalValue" | "lastSignalAt" | "lastLimitSetAt" | "createdAt" | "updatedAt", ExtArgs["result"]["site"]>
  export type SiteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }
  export type SiteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }
  export type SiteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cpoConnection?: boolean | CpoConnectionDefaultArgs<ExtArgs>
    edfRegion?: boolean | Site$edfRegionArgs<ExtArgs>
  }

  export type $SitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Site"
    objects: {
      cpoConnection: Prisma.$CpoConnectionPayload<ExtArgs>
      edfRegion: Prisma.$EdfRegionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cpoConnectionId: string
      externalId: string
      name: string
      address: string | null
      edfRegionId: string | null
      maxCapacityKw: number | null
      currentLimitKw: number | null
      reducedLimitKw: number | null
      manualOverrideLimitKw: number | null
      manualOverrideUntil: Date | null
      manualOverrideReason: string | null
      isActive: boolean
      lastSignalValue: number | null
      lastSignalAt: Date | null
      lastLimitSetAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["site"]>
    composites: {}
  }

  type SiteGetPayload<S extends boolean | null | undefined | SiteDefaultArgs> = $Result.GetResult<Prisma.$SitePayload, S>

  type SiteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SiteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SiteCountAggregateInputType | true
    }

  export interface SiteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Site'], meta: { name: 'Site' } }
    /**
     * Find zero or one Site that matches the filter.
     * @param {SiteFindUniqueArgs} args - Arguments to find a Site
     * @example
     * // Get one Site
     * const site = await prisma.site.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SiteFindUniqueArgs>(args: SelectSubset<T, SiteFindUniqueArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Site that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SiteFindUniqueOrThrowArgs} args - Arguments to find a Site
     * @example
     * // Get one Site
     * const site = await prisma.site.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SiteFindUniqueOrThrowArgs>(args: SelectSubset<T, SiteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Site that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteFindFirstArgs} args - Arguments to find a Site
     * @example
     * // Get one Site
     * const site = await prisma.site.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SiteFindFirstArgs>(args?: SelectSubset<T, SiteFindFirstArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Site that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteFindFirstOrThrowArgs} args - Arguments to find a Site
     * @example
     * // Get one Site
     * const site = await prisma.site.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SiteFindFirstOrThrowArgs>(args?: SelectSubset<T, SiteFindFirstOrThrowArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sites
     * const sites = await prisma.site.findMany()
     * 
     * // Get first 10 Sites
     * const sites = await prisma.site.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const siteWithIdOnly = await prisma.site.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SiteFindManyArgs>(args?: SelectSubset<T, SiteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Site.
     * @param {SiteCreateArgs} args - Arguments to create a Site.
     * @example
     * // Create one Site
     * const Site = await prisma.site.create({
     *   data: {
     *     // ... data to create a Site
     *   }
     * })
     * 
     */
    create<T extends SiteCreateArgs>(args: SelectSubset<T, SiteCreateArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sites.
     * @param {SiteCreateManyArgs} args - Arguments to create many Sites.
     * @example
     * // Create many Sites
     * const site = await prisma.site.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SiteCreateManyArgs>(args?: SelectSubset<T, SiteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sites and returns the data saved in the database.
     * @param {SiteCreateManyAndReturnArgs} args - Arguments to create many Sites.
     * @example
     * // Create many Sites
     * const site = await prisma.site.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sites and only return the `id`
     * const siteWithIdOnly = await prisma.site.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SiteCreateManyAndReturnArgs>(args?: SelectSubset<T, SiteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Site.
     * @param {SiteDeleteArgs} args - Arguments to delete one Site.
     * @example
     * // Delete one Site
     * const Site = await prisma.site.delete({
     *   where: {
     *     // ... filter to delete one Site
     *   }
     * })
     * 
     */
    delete<T extends SiteDeleteArgs>(args: SelectSubset<T, SiteDeleteArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Site.
     * @param {SiteUpdateArgs} args - Arguments to update one Site.
     * @example
     * // Update one Site
     * const site = await prisma.site.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SiteUpdateArgs>(args: SelectSubset<T, SiteUpdateArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sites.
     * @param {SiteDeleteManyArgs} args - Arguments to filter Sites to delete.
     * @example
     * // Delete a few Sites
     * const { count } = await prisma.site.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SiteDeleteManyArgs>(args?: SelectSubset<T, SiteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sites
     * const site = await prisma.site.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SiteUpdateManyArgs>(args: SelectSubset<T, SiteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sites and returns the data updated in the database.
     * @param {SiteUpdateManyAndReturnArgs} args - Arguments to update many Sites.
     * @example
     * // Update many Sites
     * const site = await prisma.site.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sites and only return the `id`
     * const siteWithIdOnly = await prisma.site.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SiteUpdateManyAndReturnArgs>(args: SelectSubset<T, SiteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Site.
     * @param {SiteUpsertArgs} args - Arguments to update or create a Site.
     * @example
     * // Update or create a Site
     * const site = await prisma.site.upsert({
     *   create: {
     *     // ... data to create a Site
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Site we want to update
     *   }
     * })
     */
    upsert<T extends SiteUpsertArgs>(args: SelectSubset<T, SiteUpsertArgs<ExtArgs>>): Prisma__SiteClient<$Result.GetResult<Prisma.$SitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteCountArgs} args - Arguments to filter Sites to count.
     * @example
     * // Count the number of Sites
     * const count = await prisma.site.count({
     *   where: {
     *     // ... the filter for the Sites we want to count
     *   }
     * })
    **/
    count<T extends SiteCountArgs>(
      args?: Subset<T, SiteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SiteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Site.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SiteAggregateArgs>(args: Subset<T, SiteAggregateArgs>): Prisma.PrismaPromise<GetSiteAggregateType<T>>

    /**
     * Group by Site.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SiteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SiteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SiteGroupByArgs['orderBy'] }
        : { orderBy?: SiteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SiteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSiteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Site model
   */
  readonly fields: SiteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Site.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SiteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cpoConnection<T extends CpoConnectionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CpoConnectionDefaultArgs<ExtArgs>>): Prisma__CpoConnectionClient<$Result.GetResult<Prisma.$CpoConnectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    edfRegion<T extends Site$edfRegionArgs<ExtArgs> = {}>(args?: Subset<T, Site$edfRegionArgs<ExtArgs>>): Prisma__EdfRegionClient<$Result.GetResult<Prisma.$EdfRegionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Site model
   */
  interface SiteFieldRefs {
    readonly id: FieldRef<"Site", 'String'>
    readonly cpoConnectionId: FieldRef<"Site", 'String'>
    readonly externalId: FieldRef<"Site", 'String'>
    readonly name: FieldRef<"Site", 'String'>
    readonly address: FieldRef<"Site", 'String'>
    readonly edfRegionId: FieldRef<"Site", 'String'>
    readonly maxCapacityKw: FieldRef<"Site", 'Float'>
    readonly currentLimitKw: FieldRef<"Site", 'Float'>
    readonly reducedLimitKw: FieldRef<"Site", 'Float'>
    readonly manualOverrideLimitKw: FieldRef<"Site", 'Float'>
    readonly manualOverrideUntil: FieldRef<"Site", 'DateTime'>
    readonly manualOverrideReason: FieldRef<"Site", 'String'>
    readonly isActive: FieldRef<"Site", 'Boolean'>
    readonly lastSignalValue: FieldRef<"Site", 'Int'>
    readonly lastSignalAt: FieldRef<"Site", 'DateTime'>
    readonly lastLimitSetAt: FieldRef<"Site", 'DateTime'>
    readonly createdAt: FieldRef<"Site", 'DateTime'>
    readonly updatedAt: FieldRef<"Site", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Site findUnique
   */
  export type SiteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter, which Site to fetch.
     */
    where: SiteWhereUniqueInput
  }

  /**
   * Site findUniqueOrThrow
   */
  export type SiteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter, which Site to fetch.
     */
    where: SiteWhereUniqueInput
  }

  /**
   * Site findFirst
   */
  export type SiteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter, which Site to fetch.
     */
    where?: SiteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sites to fetch.
     */
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sites.
     */
    cursor?: SiteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sites.
     */
    distinct?: SiteScalarFieldEnum | SiteScalarFieldEnum[]
  }

  /**
   * Site findFirstOrThrow
   */
  export type SiteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter, which Site to fetch.
     */
    where?: SiteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sites to fetch.
     */
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sites.
     */
    cursor?: SiteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sites.
     */
    distinct?: SiteScalarFieldEnum | SiteScalarFieldEnum[]
  }

  /**
   * Site findMany
   */
  export type SiteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter, which Sites to fetch.
     */
    where?: SiteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sites to fetch.
     */
    orderBy?: SiteOrderByWithRelationInput | SiteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sites.
     */
    cursor?: SiteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sites.
     */
    skip?: number
    distinct?: SiteScalarFieldEnum | SiteScalarFieldEnum[]
  }

  /**
   * Site create
   */
  export type SiteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * The data needed to create a Site.
     */
    data: XOR<SiteCreateInput, SiteUncheckedCreateInput>
  }

  /**
   * Site createMany
   */
  export type SiteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sites.
     */
    data: SiteCreateManyInput | SiteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Site createManyAndReturn
   */
  export type SiteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * The data used to create many Sites.
     */
    data: SiteCreateManyInput | SiteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Site update
   */
  export type SiteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * The data needed to update a Site.
     */
    data: XOR<SiteUpdateInput, SiteUncheckedUpdateInput>
    /**
     * Choose, which Site to update.
     */
    where: SiteWhereUniqueInput
  }

  /**
   * Site updateMany
   */
  export type SiteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sites.
     */
    data: XOR<SiteUpdateManyMutationInput, SiteUncheckedUpdateManyInput>
    /**
     * Filter which Sites to update
     */
    where?: SiteWhereInput
    /**
     * Limit how many Sites to update.
     */
    limit?: number
  }

  /**
   * Site updateManyAndReturn
   */
  export type SiteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * The data used to update Sites.
     */
    data: XOR<SiteUpdateManyMutationInput, SiteUncheckedUpdateManyInput>
    /**
     * Filter which Sites to update
     */
    where?: SiteWhereInput
    /**
     * Limit how many Sites to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Site upsert
   */
  export type SiteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * The filter to search for the Site to update in case it exists.
     */
    where: SiteWhereUniqueInput
    /**
     * In case the Site found by the `where` argument doesn't exist, create a new Site with this data.
     */
    create: XOR<SiteCreateInput, SiteUncheckedCreateInput>
    /**
     * In case the Site was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SiteUpdateInput, SiteUncheckedUpdateInput>
  }

  /**
   * Site delete
   */
  export type SiteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
    /**
     * Filter which Site to delete.
     */
    where: SiteWhereUniqueInput
  }

  /**
   * Site deleteMany
   */
  export type SiteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sites to delete
     */
    where?: SiteWhereInput
    /**
     * Limit how many Sites to delete.
     */
    limit?: number
  }

  /**
   * Site.edfRegion
   */
  export type Site$edfRegionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdfRegion
     */
    select?: EdfRegionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EdfRegion
     */
    omit?: EdfRegionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EdfRegionInclude<ExtArgs> | null
    where?: EdfRegionWhereInput
  }

  /**
   * Site without action
   */
  export type SiteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Site
     */
    select?: SiteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Site
     */
    omit?: SiteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SiteInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CpoConnectionScalarFieldEnum: {
    id: 'id',
    actorId: 'actorId',
    baseUrl: 'baseUrl',
    authUrl: 'authUrl',
    authType: 'authType',
    email: 'email',
    encryptedPassword: 'encryptedPassword',
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    tokenExpiresAt: 'tokenExpiresAt',
    isConnected: 'isConnected',
    fetchIntervalMinutes: 'fetchIntervalMinutes',
    fetchEnabled: 'fetchEnabled',
    lastFetchAt: 'lastFetchAt',
    nextFetchAt: 'nextFetchAt',
    lastSyncAt: 'lastSyncAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CpoConnectionScalarFieldEnum = (typeof CpoConnectionScalarFieldEnum)[keyof typeof CpoConnectionScalarFieldEnum]


  export const EdfRegionScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    apiEndpoint: 'apiEndpoint',
    datasetId: 'datasetId',
    apiKey: 'apiKey',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EdfRegionScalarFieldEnum = (typeof EdfRegionScalarFieldEnum)[keyof typeof EdfRegionScalarFieldEnum]


  export const SiteScalarFieldEnum: {
    id: 'id',
    cpoConnectionId: 'cpoConnectionId',
    externalId: 'externalId',
    name: 'name',
    address: 'address',
    edfRegionId: 'edfRegionId',
    maxCapacityKw: 'maxCapacityKw',
    currentLimitKw: 'currentLimitKw',
    reducedLimitKw: 'reducedLimitKw',
    manualOverrideLimitKw: 'manualOverrideLimitKw',
    manualOverrideUntil: 'manualOverrideUntil',
    manualOverrideReason: 'manualOverrideReason',
    isActive: 'isActive',
    lastSignalValue: 'lastSignalValue',
    lastSignalAt: 'lastSignalAt',
    lastLimitSetAt: 'lastLimitSetAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SiteScalarFieldEnum = (typeof SiteScalarFieldEnum)[keyof typeof SiteScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CpoConnectionWhereInput = {
    AND?: CpoConnectionWhereInput | CpoConnectionWhereInput[]
    OR?: CpoConnectionWhereInput[]
    NOT?: CpoConnectionWhereInput | CpoConnectionWhereInput[]
    id?: StringFilter<"CpoConnection"> | string
    actorId?: StringFilter<"CpoConnection"> | string
    baseUrl?: StringFilter<"CpoConnection"> | string
    authUrl?: StringNullableFilter<"CpoConnection"> | string | null
    authType?: StringFilter<"CpoConnection"> | string
    email?: StringNullableFilter<"CpoConnection"> | string | null
    encryptedPassword?: StringNullableFilter<"CpoConnection"> | string | null
    accessToken?: StringNullableFilter<"CpoConnection"> | string | null
    refreshToken?: StringNullableFilter<"CpoConnection"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    isConnected?: BoolFilter<"CpoConnection"> | boolean
    fetchIntervalMinutes?: IntFilter<"CpoConnection"> | number
    fetchEnabled?: BoolFilter<"CpoConnection"> | boolean
    lastFetchAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    nextFetchAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    lastSyncAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    createdAt?: DateTimeFilter<"CpoConnection"> | Date | string
    updatedAt?: DateTimeFilter<"CpoConnection"> | Date | string
    sites?: SiteListRelationFilter
  }

  export type CpoConnectionOrderByWithRelationInput = {
    id?: SortOrder
    actorId?: SortOrder
    baseUrl?: SortOrder
    authUrl?: SortOrderInput | SortOrder
    authType?: SortOrder
    email?: SortOrderInput | SortOrder
    encryptedPassword?: SortOrderInput | SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    isConnected?: SortOrder
    fetchIntervalMinutes?: SortOrder
    fetchEnabled?: SortOrder
    lastFetchAt?: SortOrderInput | SortOrder
    nextFetchAt?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sites?: SiteOrderByRelationAggregateInput
  }

  export type CpoConnectionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    actorId?: string
    AND?: CpoConnectionWhereInput | CpoConnectionWhereInput[]
    OR?: CpoConnectionWhereInput[]
    NOT?: CpoConnectionWhereInput | CpoConnectionWhereInput[]
    baseUrl?: StringFilter<"CpoConnection"> | string
    authUrl?: StringNullableFilter<"CpoConnection"> | string | null
    authType?: StringFilter<"CpoConnection"> | string
    email?: StringNullableFilter<"CpoConnection"> | string | null
    encryptedPassword?: StringNullableFilter<"CpoConnection"> | string | null
    accessToken?: StringNullableFilter<"CpoConnection"> | string | null
    refreshToken?: StringNullableFilter<"CpoConnection"> | string | null
    tokenExpiresAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    isConnected?: BoolFilter<"CpoConnection"> | boolean
    fetchIntervalMinutes?: IntFilter<"CpoConnection"> | number
    fetchEnabled?: BoolFilter<"CpoConnection"> | boolean
    lastFetchAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    nextFetchAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    lastSyncAt?: DateTimeNullableFilter<"CpoConnection"> | Date | string | null
    createdAt?: DateTimeFilter<"CpoConnection"> | Date | string
    updatedAt?: DateTimeFilter<"CpoConnection"> | Date | string
    sites?: SiteListRelationFilter
  }, "id" | "actorId">

  export type CpoConnectionOrderByWithAggregationInput = {
    id?: SortOrder
    actorId?: SortOrder
    baseUrl?: SortOrder
    authUrl?: SortOrderInput | SortOrder
    authType?: SortOrder
    email?: SortOrderInput | SortOrder
    encryptedPassword?: SortOrderInput | SortOrder
    accessToken?: SortOrderInput | SortOrder
    refreshToken?: SortOrderInput | SortOrder
    tokenExpiresAt?: SortOrderInput | SortOrder
    isConnected?: SortOrder
    fetchIntervalMinutes?: SortOrder
    fetchEnabled?: SortOrder
    lastFetchAt?: SortOrderInput | SortOrder
    nextFetchAt?: SortOrderInput | SortOrder
    lastSyncAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CpoConnectionCountOrderByAggregateInput
    _avg?: CpoConnectionAvgOrderByAggregateInput
    _max?: CpoConnectionMaxOrderByAggregateInput
    _min?: CpoConnectionMinOrderByAggregateInput
    _sum?: CpoConnectionSumOrderByAggregateInput
  }

  export type CpoConnectionScalarWhereWithAggregatesInput = {
    AND?: CpoConnectionScalarWhereWithAggregatesInput | CpoConnectionScalarWhereWithAggregatesInput[]
    OR?: CpoConnectionScalarWhereWithAggregatesInput[]
    NOT?: CpoConnectionScalarWhereWithAggregatesInput | CpoConnectionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CpoConnection"> | string
    actorId?: StringWithAggregatesFilter<"CpoConnection"> | string
    baseUrl?: StringWithAggregatesFilter<"CpoConnection"> | string
    authUrl?: StringNullableWithAggregatesFilter<"CpoConnection"> | string | null
    authType?: StringWithAggregatesFilter<"CpoConnection"> | string
    email?: StringNullableWithAggregatesFilter<"CpoConnection"> | string | null
    encryptedPassword?: StringNullableWithAggregatesFilter<"CpoConnection"> | string | null
    accessToken?: StringNullableWithAggregatesFilter<"CpoConnection"> | string | null
    refreshToken?: StringNullableWithAggregatesFilter<"CpoConnection"> | string | null
    tokenExpiresAt?: DateTimeNullableWithAggregatesFilter<"CpoConnection"> | Date | string | null
    isConnected?: BoolWithAggregatesFilter<"CpoConnection"> | boolean
    fetchIntervalMinutes?: IntWithAggregatesFilter<"CpoConnection"> | number
    fetchEnabled?: BoolWithAggregatesFilter<"CpoConnection"> | boolean
    lastFetchAt?: DateTimeNullableWithAggregatesFilter<"CpoConnection"> | Date | string | null
    nextFetchAt?: DateTimeNullableWithAggregatesFilter<"CpoConnection"> | Date | string | null
    lastSyncAt?: DateTimeNullableWithAggregatesFilter<"CpoConnection"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CpoConnection"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CpoConnection"> | Date | string
  }

  export type EdfRegionWhereInput = {
    AND?: EdfRegionWhereInput | EdfRegionWhereInput[]
    OR?: EdfRegionWhereInput[]
    NOT?: EdfRegionWhereInput | EdfRegionWhereInput[]
    id?: StringFilter<"EdfRegion"> | string
    code?: StringFilter<"EdfRegion"> | string
    name?: StringFilter<"EdfRegion"> | string
    apiEndpoint?: StringFilter<"EdfRegion"> | string
    datasetId?: StringFilter<"EdfRegion"> | string
    apiKey?: StringNullableFilter<"EdfRegion"> | string | null
    isActive?: BoolFilter<"EdfRegion"> | boolean
    createdAt?: DateTimeFilter<"EdfRegion"> | Date | string
    updatedAt?: DateTimeFilter<"EdfRegion"> | Date | string
    sites?: SiteListRelationFilter
  }

  export type EdfRegionOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    apiEndpoint?: SortOrder
    datasetId?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sites?: SiteOrderByRelationAggregateInput
  }

  export type EdfRegionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: EdfRegionWhereInput | EdfRegionWhereInput[]
    OR?: EdfRegionWhereInput[]
    NOT?: EdfRegionWhereInput | EdfRegionWhereInput[]
    name?: StringFilter<"EdfRegion"> | string
    apiEndpoint?: StringFilter<"EdfRegion"> | string
    datasetId?: StringFilter<"EdfRegion"> | string
    apiKey?: StringNullableFilter<"EdfRegion"> | string | null
    isActive?: BoolFilter<"EdfRegion"> | boolean
    createdAt?: DateTimeFilter<"EdfRegion"> | Date | string
    updatedAt?: DateTimeFilter<"EdfRegion"> | Date | string
    sites?: SiteListRelationFilter
  }, "id" | "code">

  export type EdfRegionOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    apiEndpoint?: SortOrder
    datasetId?: SortOrder
    apiKey?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EdfRegionCountOrderByAggregateInput
    _max?: EdfRegionMaxOrderByAggregateInput
    _min?: EdfRegionMinOrderByAggregateInput
  }

  export type EdfRegionScalarWhereWithAggregatesInput = {
    AND?: EdfRegionScalarWhereWithAggregatesInput | EdfRegionScalarWhereWithAggregatesInput[]
    OR?: EdfRegionScalarWhereWithAggregatesInput[]
    NOT?: EdfRegionScalarWhereWithAggregatesInput | EdfRegionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EdfRegion"> | string
    code?: StringWithAggregatesFilter<"EdfRegion"> | string
    name?: StringWithAggregatesFilter<"EdfRegion"> | string
    apiEndpoint?: StringWithAggregatesFilter<"EdfRegion"> | string
    datasetId?: StringWithAggregatesFilter<"EdfRegion"> | string
    apiKey?: StringNullableWithAggregatesFilter<"EdfRegion"> | string | null
    isActive?: BoolWithAggregatesFilter<"EdfRegion"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"EdfRegion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"EdfRegion"> | Date | string
  }

  export type SiteWhereInput = {
    AND?: SiteWhereInput | SiteWhereInput[]
    OR?: SiteWhereInput[]
    NOT?: SiteWhereInput | SiteWhereInput[]
    id?: StringFilter<"Site"> | string
    cpoConnectionId?: StringFilter<"Site"> | string
    externalId?: StringFilter<"Site"> | string
    name?: StringFilter<"Site"> | string
    address?: StringNullableFilter<"Site"> | string | null
    edfRegionId?: StringNullableFilter<"Site"> | string | null
    maxCapacityKw?: FloatNullableFilter<"Site"> | number | null
    currentLimitKw?: FloatNullableFilter<"Site"> | number | null
    reducedLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideUntil?: DateTimeNullableFilter<"Site"> | Date | string | null
    manualOverrideReason?: StringNullableFilter<"Site"> | string | null
    isActive?: BoolFilter<"Site"> | boolean
    lastSignalValue?: IntNullableFilter<"Site"> | number | null
    lastSignalAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    lastLimitSetAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    createdAt?: DateTimeFilter<"Site"> | Date | string
    updatedAt?: DateTimeFilter<"Site"> | Date | string
    cpoConnection?: XOR<CpoConnectionScalarRelationFilter, CpoConnectionWhereInput>
    edfRegion?: XOR<EdfRegionNullableScalarRelationFilter, EdfRegionWhereInput> | null
  }

  export type SiteOrderByWithRelationInput = {
    id?: SortOrder
    cpoConnectionId?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    edfRegionId?: SortOrderInput | SortOrder
    maxCapacityKw?: SortOrderInput | SortOrder
    currentLimitKw?: SortOrderInput | SortOrder
    reducedLimitKw?: SortOrderInput | SortOrder
    manualOverrideLimitKw?: SortOrderInput | SortOrder
    manualOverrideUntil?: SortOrderInput | SortOrder
    manualOverrideReason?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastSignalValue?: SortOrderInput | SortOrder
    lastSignalAt?: SortOrderInput | SortOrder
    lastLimitSetAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cpoConnection?: CpoConnectionOrderByWithRelationInput
    edfRegion?: EdfRegionOrderByWithRelationInput
  }

  export type SiteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cpoConnectionId_externalId?: SiteCpoConnectionIdExternalIdCompoundUniqueInput
    AND?: SiteWhereInput | SiteWhereInput[]
    OR?: SiteWhereInput[]
    NOT?: SiteWhereInput | SiteWhereInput[]
    cpoConnectionId?: StringFilter<"Site"> | string
    externalId?: StringFilter<"Site"> | string
    name?: StringFilter<"Site"> | string
    address?: StringNullableFilter<"Site"> | string | null
    edfRegionId?: StringNullableFilter<"Site"> | string | null
    maxCapacityKw?: FloatNullableFilter<"Site"> | number | null
    currentLimitKw?: FloatNullableFilter<"Site"> | number | null
    reducedLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideUntil?: DateTimeNullableFilter<"Site"> | Date | string | null
    manualOverrideReason?: StringNullableFilter<"Site"> | string | null
    isActive?: BoolFilter<"Site"> | boolean
    lastSignalValue?: IntNullableFilter<"Site"> | number | null
    lastSignalAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    lastLimitSetAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    createdAt?: DateTimeFilter<"Site"> | Date | string
    updatedAt?: DateTimeFilter<"Site"> | Date | string
    cpoConnection?: XOR<CpoConnectionScalarRelationFilter, CpoConnectionWhereInput>
    edfRegion?: XOR<EdfRegionNullableScalarRelationFilter, EdfRegionWhereInput> | null
  }, "id" | "cpoConnectionId_externalId">

  export type SiteOrderByWithAggregationInput = {
    id?: SortOrder
    cpoConnectionId?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    edfRegionId?: SortOrderInput | SortOrder
    maxCapacityKw?: SortOrderInput | SortOrder
    currentLimitKw?: SortOrderInput | SortOrder
    reducedLimitKw?: SortOrderInput | SortOrder
    manualOverrideLimitKw?: SortOrderInput | SortOrder
    manualOverrideUntil?: SortOrderInput | SortOrder
    manualOverrideReason?: SortOrderInput | SortOrder
    isActive?: SortOrder
    lastSignalValue?: SortOrderInput | SortOrder
    lastSignalAt?: SortOrderInput | SortOrder
    lastLimitSetAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SiteCountOrderByAggregateInput
    _avg?: SiteAvgOrderByAggregateInput
    _max?: SiteMaxOrderByAggregateInput
    _min?: SiteMinOrderByAggregateInput
    _sum?: SiteSumOrderByAggregateInput
  }

  export type SiteScalarWhereWithAggregatesInput = {
    AND?: SiteScalarWhereWithAggregatesInput | SiteScalarWhereWithAggregatesInput[]
    OR?: SiteScalarWhereWithAggregatesInput[]
    NOT?: SiteScalarWhereWithAggregatesInput | SiteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Site"> | string
    cpoConnectionId?: StringWithAggregatesFilter<"Site"> | string
    externalId?: StringWithAggregatesFilter<"Site"> | string
    name?: StringWithAggregatesFilter<"Site"> | string
    address?: StringNullableWithAggregatesFilter<"Site"> | string | null
    edfRegionId?: StringNullableWithAggregatesFilter<"Site"> | string | null
    maxCapacityKw?: FloatNullableWithAggregatesFilter<"Site"> | number | null
    currentLimitKw?: FloatNullableWithAggregatesFilter<"Site"> | number | null
    reducedLimitKw?: FloatNullableWithAggregatesFilter<"Site"> | number | null
    manualOverrideLimitKw?: FloatNullableWithAggregatesFilter<"Site"> | number | null
    manualOverrideUntil?: DateTimeNullableWithAggregatesFilter<"Site"> | Date | string | null
    manualOverrideReason?: StringNullableWithAggregatesFilter<"Site"> | string | null
    isActive?: BoolWithAggregatesFilter<"Site"> | boolean
    lastSignalValue?: IntNullableWithAggregatesFilter<"Site"> | number | null
    lastSignalAt?: DateTimeNullableWithAggregatesFilter<"Site"> | Date | string | null
    lastLimitSetAt?: DateTimeNullableWithAggregatesFilter<"Site"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Site"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Site"> | Date | string
  }

  export type CpoConnectionCreateInput = {
    id?: string
    actorId: string
    baseUrl: string
    authUrl?: string | null
    authType: string
    email?: string | null
    encryptedPassword?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | string | null
    isConnected?: boolean
    fetchIntervalMinutes?: number
    fetchEnabled?: boolean
    lastFetchAt?: Date | string | null
    nextFetchAt?: Date | string | null
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sites?: SiteCreateNestedManyWithoutCpoConnectionInput
  }

  export type CpoConnectionUncheckedCreateInput = {
    id?: string
    actorId: string
    baseUrl: string
    authUrl?: string | null
    authType: string
    email?: string | null
    encryptedPassword?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | string | null
    isConnected?: boolean
    fetchIntervalMinutes?: number
    fetchEnabled?: boolean
    lastFetchAt?: Date | string | null
    nextFetchAt?: Date | string | null
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sites?: SiteUncheckedCreateNestedManyWithoutCpoConnectionInput
  }

  export type CpoConnectionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sites?: SiteUpdateManyWithoutCpoConnectionNestedInput
  }

  export type CpoConnectionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sites?: SiteUncheckedUpdateManyWithoutCpoConnectionNestedInput
  }

  export type CpoConnectionCreateManyInput = {
    id?: string
    actorId: string
    baseUrl: string
    authUrl?: string | null
    authType: string
    email?: string | null
    encryptedPassword?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | string | null
    isConnected?: boolean
    fetchIntervalMinutes?: number
    fetchEnabled?: boolean
    lastFetchAt?: Date | string | null
    nextFetchAt?: Date | string | null
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CpoConnectionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CpoConnectionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EdfRegionCreateInput = {
    id?: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sites?: SiteCreateNestedManyWithoutEdfRegionInput
  }

  export type EdfRegionUncheckedCreateInput = {
    id?: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sites?: SiteUncheckedCreateNestedManyWithoutEdfRegionInput
  }

  export type EdfRegionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sites?: SiteUpdateManyWithoutEdfRegionNestedInput
  }

  export type EdfRegionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sites?: SiteUncheckedUpdateManyWithoutEdfRegionNestedInput
  }

  export type EdfRegionCreateManyInput = {
    id?: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EdfRegionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EdfRegionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteCreateInput = {
    id?: string
    externalId: string
    name: string
    address?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cpoConnection: CpoConnectionCreateNestedOneWithoutSitesInput
    edfRegion?: EdfRegionCreateNestedOneWithoutSitesInput
  }

  export type SiteUncheckedCreateInput = {
    id?: string
    cpoConnectionId: string
    externalId: string
    name: string
    address?: string | null
    edfRegionId?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cpoConnection?: CpoConnectionUpdateOneRequiredWithoutSitesNestedInput
    edfRegion?: EdfRegionUpdateOneWithoutSitesNestedInput
  }

  export type SiteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpoConnectionId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    edfRegionId?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteCreateManyInput = {
    id?: string
    cpoConnectionId: string
    externalId: string
    name: string
    address?: string | null
    edfRegionId?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpoConnectionId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    edfRegionId?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SiteListRelationFilter = {
    every?: SiteWhereInput
    some?: SiteWhereInput
    none?: SiteWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SiteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CpoConnectionCountOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    baseUrl?: SortOrder
    authUrl?: SortOrder
    authType?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    tokenExpiresAt?: SortOrder
    isConnected?: SortOrder
    fetchIntervalMinutes?: SortOrder
    fetchEnabled?: SortOrder
    lastFetchAt?: SortOrder
    nextFetchAt?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CpoConnectionAvgOrderByAggregateInput = {
    fetchIntervalMinutes?: SortOrder
  }

  export type CpoConnectionMaxOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    baseUrl?: SortOrder
    authUrl?: SortOrder
    authType?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    tokenExpiresAt?: SortOrder
    isConnected?: SortOrder
    fetchIntervalMinutes?: SortOrder
    fetchEnabled?: SortOrder
    lastFetchAt?: SortOrder
    nextFetchAt?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CpoConnectionMinOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    baseUrl?: SortOrder
    authUrl?: SortOrder
    authType?: SortOrder
    email?: SortOrder
    encryptedPassword?: SortOrder
    accessToken?: SortOrder
    refreshToken?: SortOrder
    tokenExpiresAt?: SortOrder
    isConnected?: SortOrder
    fetchIntervalMinutes?: SortOrder
    fetchEnabled?: SortOrder
    lastFetchAt?: SortOrder
    nextFetchAt?: SortOrder
    lastSyncAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CpoConnectionSumOrderByAggregateInput = {
    fetchIntervalMinutes?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EdfRegionCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    apiEndpoint?: SortOrder
    datasetId?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EdfRegionMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    apiEndpoint?: SortOrder
    datasetId?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EdfRegionMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    apiEndpoint?: SortOrder
    datasetId?: SortOrder
    apiKey?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type CpoConnectionScalarRelationFilter = {
    is?: CpoConnectionWhereInput
    isNot?: CpoConnectionWhereInput
  }

  export type EdfRegionNullableScalarRelationFilter = {
    is?: EdfRegionWhereInput | null
    isNot?: EdfRegionWhereInput | null
  }

  export type SiteCpoConnectionIdExternalIdCompoundUniqueInput = {
    cpoConnectionId: string
    externalId: string
  }

  export type SiteCountOrderByAggregateInput = {
    id?: SortOrder
    cpoConnectionId?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    address?: SortOrder
    edfRegionId?: SortOrder
    maxCapacityKw?: SortOrder
    currentLimitKw?: SortOrder
    reducedLimitKw?: SortOrder
    manualOverrideLimitKw?: SortOrder
    manualOverrideUntil?: SortOrder
    manualOverrideReason?: SortOrder
    isActive?: SortOrder
    lastSignalValue?: SortOrder
    lastSignalAt?: SortOrder
    lastLimitSetAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SiteAvgOrderByAggregateInput = {
    maxCapacityKw?: SortOrder
    currentLimitKw?: SortOrder
    reducedLimitKw?: SortOrder
    manualOverrideLimitKw?: SortOrder
    lastSignalValue?: SortOrder
  }

  export type SiteMaxOrderByAggregateInput = {
    id?: SortOrder
    cpoConnectionId?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    address?: SortOrder
    edfRegionId?: SortOrder
    maxCapacityKw?: SortOrder
    currentLimitKw?: SortOrder
    reducedLimitKw?: SortOrder
    manualOverrideLimitKw?: SortOrder
    manualOverrideUntil?: SortOrder
    manualOverrideReason?: SortOrder
    isActive?: SortOrder
    lastSignalValue?: SortOrder
    lastSignalAt?: SortOrder
    lastLimitSetAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SiteMinOrderByAggregateInput = {
    id?: SortOrder
    cpoConnectionId?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    address?: SortOrder
    edfRegionId?: SortOrder
    maxCapacityKw?: SortOrder
    currentLimitKw?: SortOrder
    reducedLimitKw?: SortOrder
    manualOverrideLimitKw?: SortOrder
    manualOverrideUntil?: SortOrder
    manualOverrideReason?: SortOrder
    isActive?: SortOrder
    lastSignalValue?: SortOrder
    lastSignalAt?: SortOrder
    lastLimitSetAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SiteSumOrderByAggregateInput = {
    maxCapacityKw?: SortOrder
    currentLimitKw?: SortOrder
    reducedLimitKw?: SortOrder
    manualOverrideLimitKw?: SortOrder
    lastSignalValue?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SiteCreateNestedManyWithoutCpoConnectionInput = {
    create?: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput> | SiteCreateWithoutCpoConnectionInput[] | SiteUncheckedCreateWithoutCpoConnectionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutCpoConnectionInput | SiteCreateOrConnectWithoutCpoConnectionInput[]
    createMany?: SiteCreateManyCpoConnectionInputEnvelope
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
  }

  export type SiteUncheckedCreateNestedManyWithoutCpoConnectionInput = {
    create?: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput> | SiteCreateWithoutCpoConnectionInput[] | SiteUncheckedCreateWithoutCpoConnectionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutCpoConnectionInput | SiteCreateOrConnectWithoutCpoConnectionInput[]
    createMany?: SiteCreateManyCpoConnectionInputEnvelope
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SiteUpdateManyWithoutCpoConnectionNestedInput = {
    create?: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput> | SiteCreateWithoutCpoConnectionInput[] | SiteUncheckedCreateWithoutCpoConnectionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutCpoConnectionInput | SiteCreateOrConnectWithoutCpoConnectionInput[]
    upsert?: SiteUpsertWithWhereUniqueWithoutCpoConnectionInput | SiteUpsertWithWhereUniqueWithoutCpoConnectionInput[]
    createMany?: SiteCreateManyCpoConnectionInputEnvelope
    set?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    disconnect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    delete?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    update?: SiteUpdateWithWhereUniqueWithoutCpoConnectionInput | SiteUpdateWithWhereUniqueWithoutCpoConnectionInput[]
    updateMany?: SiteUpdateManyWithWhereWithoutCpoConnectionInput | SiteUpdateManyWithWhereWithoutCpoConnectionInput[]
    deleteMany?: SiteScalarWhereInput | SiteScalarWhereInput[]
  }

  export type SiteUncheckedUpdateManyWithoutCpoConnectionNestedInput = {
    create?: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput> | SiteCreateWithoutCpoConnectionInput[] | SiteUncheckedCreateWithoutCpoConnectionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutCpoConnectionInput | SiteCreateOrConnectWithoutCpoConnectionInput[]
    upsert?: SiteUpsertWithWhereUniqueWithoutCpoConnectionInput | SiteUpsertWithWhereUniqueWithoutCpoConnectionInput[]
    createMany?: SiteCreateManyCpoConnectionInputEnvelope
    set?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    disconnect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    delete?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    update?: SiteUpdateWithWhereUniqueWithoutCpoConnectionInput | SiteUpdateWithWhereUniqueWithoutCpoConnectionInput[]
    updateMany?: SiteUpdateManyWithWhereWithoutCpoConnectionInput | SiteUpdateManyWithWhereWithoutCpoConnectionInput[]
    deleteMany?: SiteScalarWhereInput | SiteScalarWhereInput[]
  }

  export type SiteCreateNestedManyWithoutEdfRegionInput = {
    create?: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput> | SiteCreateWithoutEdfRegionInput[] | SiteUncheckedCreateWithoutEdfRegionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutEdfRegionInput | SiteCreateOrConnectWithoutEdfRegionInput[]
    createMany?: SiteCreateManyEdfRegionInputEnvelope
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
  }

  export type SiteUncheckedCreateNestedManyWithoutEdfRegionInput = {
    create?: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput> | SiteCreateWithoutEdfRegionInput[] | SiteUncheckedCreateWithoutEdfRegionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutEdfRegionInput | SiteCreateOrConnectWithoutEdfRegionInput[]
    createMany?: SiteCreateManyEdfRegionInputEnvelope
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
  }

  export type SiteUpdateManyWithoutEdfRegionNestedInput = {
    create?: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput> | SiteCreateWithoutEdfRegionInput[] | SiteUncheckedCreateWithoutEdfRegionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutEdfRegionInput | SiteCreateOrConnectWithoutEdfRegionInput[]
    upsert?: SiteUpsertWithWhereUniqueWithoutEdfRegionInput | SiteUpsertWithWhereUniqueWithoutEdfRegionInput[]
    createMany?: SiteCreateManyEdfRegionInputEnvelope
    set?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    disconnect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    delete?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    update?: SiteUpdateWithWhereUniqueWithoutEdfRegionInput | SiteUpdateWithWhereUniqueWithoutEdfRegionInput[]
    updateMany?: SiteUpdateManyWithWhereWithoutEdfRegionInput | SiteUpdateManyWithWhereWithoutEdfRegionInput[]
    deleteMany?: SiteScalarWhereInput | SiteScalarWhereInput[]
  }

  export type SiteUncheckedUpdateManyWithoutEdfRegionNestedInput = {
    create?: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput> | SiteCreateWithoutEdfRegionInput[] | SiteUncheckedCreateWithoutEdfRegionInput[]
    connectOrCreate?: SiteCreateOrConnectWithoutEdfRegionInput | SiteCreateOrConnectWithoutEdfRegionInput[]
    upsert?: SiteUpsertWithWhereUniqueWithoutEdfRegionInput | SiteUpsertWithWhereUniqueWithoutEdfRegionInput[]
    createMany?: SiteCreateManyEdfRegionInputEnvelope
    set?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    disconnect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    delete?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    connect?: SiteWhereUniqueInput | SiteWhereUniqueInput[]
    update?: SiteUpdateWithWhereUniqueWithoutEdfRegionInput | SiteUpdateWithWhereUniqueWithoutEdfRegionInput[]
    updateMany?: SiteUpdateManyWithWhereWithoutEdfRegionInput | SiteUpdateManyWithWhereWithoutEdfRegionInput[]
    deleteMany?: SiteScalarWhereInput | SiteScalarWhereInput[]
  }

  export type CpoConnectionCreateNestedOneWithoutSitesInput = {
    create?: XOR<CpoConnectionCreateWithoutSitesInput, CpoConnectionUncheckedCreateWithoutSitesInput>
    connectOrCreate?: CpoConnectionCreateOrConnectWithoutSitesInput
    connect?: CpoConnectionWhereUniqueInput
  }

  export type EdfRegionCreateNestedOneWithoutSitesInput = {
    create?: XOR<EdfRegionCreateWithoutSitesInput, EdfRegionUncheckedCreateWithoutSitesInput>
    connectOrCreate?: EdfRegionCreateOrConnectWithoutSitesInput
    connect?: EdfRegionWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CpoConnectionUpdateOneRequiredWithoutSitesNestedInput = {
    create?: XOR<CpoConnectionCreateWithoutSitesInput, CpoConnectionUncheckedCreateWithoutSitesInput>
    connectOrCreate?: CpoConnectionCreateOrConnectWithoutSitesInput
    upsert?: CpoConnectionUpsertWithoutSitesInput
    connect?: CpoConnectionWhereUniqueInput
    update?: XOR<XOR<CpoConnectionUpdateToOneWithWhereWithoutSitesInput, CpoConnectionUpdateWithoutSitesInput>, CpoConnectionUncheckedUpdateWithoutSitesInput>
  }

  export type EdfRegionUpdateOneWithoutSitesNestedInput = {
    create?: XOR<EdfRegionCreateWithoutSitesInput, EdfRegionUncheckedCreateWithoutSitesInput>
    connectOrCreate?: EdfRegionCreateOrConnectWithoutSitesInput
    upsert?: EdfRegionUpsertWithoutSitesInput
    disconnect?: EdfRegionWhereInput | boolean
    delete?: EdfRegionWhereInput | boolean
    connect?: EdfRegionWhereUniqueInput
    update?: XOR<XOR<EdfRegionUpdateToOneWithWhereWithoutSitesInput, EdfRegionUpdateWithoutSitesInput>, EdfRegionUncheckedUpdateWithoutSitesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SiteCreateWithoutCpoConnectionInput = {
    id?: string
    externalId: string
    name: string
    address?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    edfRegion?: EdfRegionCreateNestedOneWithoutSitesInput
  }

  export type SiteUncheckedCreateWithoutCpoConnectionInput = {
    id?: string
    externalId: string
    name: string
    address?: string | null
    edfRegionId?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteCreateOrConnectWithoutCpoConnectionInput = {
    where: SiteWhereUniqueInput
    create: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput>
  }

  export type SiteCreateManyCpoConnectionInputEnvelope = {
    data: SiteCreateManyCpoConnectionInput | SiteCreateManyCpoConnectionInput[]
    skipDuplicates?: boolean
  }

  export type SiteUpsertWithWhereUniqueWithoutCpoConnectionInput = {
    where: SiteWhereUniqueInput
    update: XOR<SiteUpdateWithoutCpoConnectionInput, SiteUncheckedUpdateWithoutCpoConnectionInput>
    create: XOR<SiteCreateWithoutCpoConnectionInput, SiteUncheckedCreateWithoutCpoConnectionInput>
  }

  export type SiteUpdateWithWhereUniqueWithoutCpoConnectionInput = {
    where: SiteWhereUniqueInput
    data: XOR<SiteUpdateWithoutCpoConnectionInput, SiteUncheckedUpdateWithoutCpoConnectionInput>
  }

  export type SiteUpdateManyWithWhereWithoutCpoConnectionInput = {
    where: SiteScalarWhereInput
    data: XOR<SiteUpdateManyMutationInput, SiteUncheckedUpdateManyWithoutCpoConnectionInput>
  }

  export type SiteScalarWhereInput = {
    AND?: SiteScalarWhereInput | SiteScalarWhereInput[]
    OR?: SiteScalarWhereInput[]
    NOT?: SiteScalarWhereInput | SiteScalarWhereInput[]
    id?: StringFilter<"Site"> | string
    cpoConnectionId?: StringFilter<"Site"> | string
    externalId?: StringFilter<"Site"> | string
    name?: StringFilter<"Site"> | string
    address?: StringNullableFilter<"Site"> | string | null
    edfRegionId?: StringNullableFilter<"Site"> | string | null
    maxCapacityKw?: FloatNullableFilter<"Site"> | number | null
    currentLimitKw?: FloatNullableFilter<"Site"> | number | null
    reducedLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideLimitKw?: FloatNullableFilter<"Site"> | number | null
    manualOverrideUntil?: DateTimeNullableFilter<"Site"> | Date | string | null
    manualOverrideReason?: StringNullableFilter<"Site"> | string | null
    isActive?: BoolFilter<"Site"> | boolean
    lastSignalValue?: IntNullableFilter<"Site"> | number | null
    lastSignalAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    lastLimitSetAt?: DateTimeNullableFilter<"Site"> | Date | string | null
    createdAt?: DateTimeFilter<"Site"> | Date | string
    updatedAt?: DateTimeFilter<"Site"> | Date | string
  }

  export type SiteCreateWithoutEdfRegionInput = {
    id?: string
    externalId: string
    name: string
    address?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cpoConnection: CpoConnectionCreateNestedOneWithoutSitesInput
  }

  export type SiteUncheckedCreateWithoutEdfRegionInput = {
    id?: string
    cpoConnectionId: string
    externalId: string
    name: string
    address?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteCreateOrConnectWithoutEdfRegionInput = {
    where: SiteWhereUniqueInput
    create: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput>
  }

  export type SiteCreateManyEdfRegionInputEnvelope = {
    data: SiteCreateManyEdfRegionInput | SiteCreateManyEdfRegionInput[]
    skipDuplicates?: boolean
  }

  export type SiteUpsertWithWhereUniqueWithoutEdfRegionInput = {
    where: SiteWhereUniqueInput
    update: XOR<SiteUpdateWithoutEdfRegionInput, SiteUncheckedUpdateWithoutEdfRegionInput>
    create: XOR<SiteCreateWithoutEdfRegionInput, SiteUncheckedCreateWithoutEdfRegionInput>
  }

  export type SiteUpdateWithWhereUniqueWithoutEdfRegionInput = {
    where: SiteWhereUniqueInput
    data: XOR<SiteUpdateWithoutEdfRegionInput, SiteUncheckedUpdateWithoutEdfRegionInput>
  }

  export type SiteUpdateManyWithWhereWithoutEdfRegionInput = {
    where: SiteScalarWhereInput
    data: XOR<SiteUpdateManyMutationInput, SiteUncheckedUpdateManyWithoutEdfRegionInput>
  }

  export type CpoConnectionCreateWithoutSitesInput = {
    id?: string
    actorId: string
    baseUrl: string
    authUrl?: string | null
    authType: string
    email?: string | null
    encryptedPassword?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | string | null
    isConnected?: boolean
    fetchIntervalMinutes?: number
    fetchEnabled?: boolean
    lastFetchAt?: Date | string | null
    nextFetchAt?: Date | string | null
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CpoConnectionUncheckedCreateWithoutSitesInput = {
    id?: string
    actorId: string
    baseUrl: string
    authUrl?: string | null
    authType: string
    email?: string | null
    encryptedPassword?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | string | null
    isConnected?: boolean
    fetchIntervalMinutes?: number
    fetchEnabled?: boolean
    lastFetchAt?: Date | string | null
    nextFetchAt?: Date | string | null
    lastSyncAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CpoConnectionCreateOrConnectWithoutSitesInput = {
    where: CpoConnectionWhereUniqueInput
    create: XOR<CpoConnectionCreateWithoutSitesInput, CpoConnectionUncheckedCreateWithoutSitesInput>
  }

  export type EdfRegionCreateWithoutSitesInput = {
    id?: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EdfRegionUncheckedCreateWithoutSitesInput = {
    id?: string
    code: string
    name: string
    apiEndpoint: string
    datasetId: string
    apiKey?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EdfRegionCreateOrConnectWithoutSitesInput = {
    where: EdfRegionWhereUniqueInput
    create: XOR<EdfRegionCreateWithoutSitesInput, EdfRegionUncheckedCreateWithoutSitesInput>
  }

  export type CpoConnectionUpsertWithoutSitesInput = {
    update: XOR<CpoConnectionUpdateWithoutSitesInput, CpoConnectionUncheckedUpdateWithoutSitesInput>
    create: XOR<CpoConnectionCreateWithoutSitesInput, CpoConnectionUncheckedCreateWithoutSitesInput>
    where?: CpoConnectionWhereInput
  }

  export type CpoConnectionUpdateToOneWithWhereWithoutSitesInput = {
    where?: CpoConnectionWhereInput
    data: XOR<CpoConnectionUpdateWithoutSitesInput, CpoConnectionUncheckedUpdateWithoutSitesInput>
  }

  export type CpoConnectionUpdateWithoutSitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CpoConnectionUncheckedUpdateWithoutSitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    baseUrl?: StringFieldUpdateOperationsInput | string
    authUrl?: NullableStringFieldUpdateOperationsInput | string | null
    authType?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: NullableStringFieldUpdateOperationsInput | string | null
    accessToken?: NullableStringFieldUpdateOperationsInput | string | null
    refreshToken?: NullableStringFieldUpdateOperationsInput | string | null
    tokenExpiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isConnected?: BoolFieldUpdateOperationsInput | boolean
    fetchIntervalMinutes?: IntFieldUpdateOperationsInput | number
    fetchEnabled?: BoolFieldUpdateOperationsInput | boolean
    lastFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    nextFetchAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSyncAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EdfRegionUpsertWithoutSitesInput = {
    update: XOR<EdfRegionUpdateWithoutSitesInput, EdfRegionUncheckedUpdateWithoutSitesInput>
    create: XOR<EdfRegionCreateWithoutSitesInput, EdfRegionUncheckedCreateWithoutSitesInput>
    where?: EdfRegionWhereInput
  }

  export type EdfRegionUpdateToOneWithWhereWithoutSitesInput = {
    where?: EdfRegionWhereInput
    data: XOR<EdfRegionUpdateWithoutSitesInput, EdfRegionUncheckedUpdateWithoutSitesInput>
  }

  export type EdfRegionUpdateWithoutSitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EdfRegionUncheckedUpdateWithoutSitesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    apiEndpoint?: StringFieldUpdateOperationsInput | string
    datasetId?: StringFieldUpdateOperationsInput | string
    apiKey?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteCreateManyCpoConnectionInput = {
    id?: string
    externalId: string
    name: string
    address?: string | null
    edfRegionId?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteUpdateWithoutCpoConnectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    edfRegion?: EdfRegionUpdateOneWithoutSitesNestedInput
  }

  export type SiteUncheckedUpdateWithoutCpoConnectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    edfRegionId?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteUncheckedUpdateManyWithoutCpoConnectionInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    edfRegionId?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteCreateManyEdfRegionInput = {
    id?: string
    cpoConnectionId: string
    externalId: string
    name: string
    address?: string | null
    maxCapacityKw?: number | null
    currentLimitKw?: number | null
    reducedLimitKw?: number | null
    manualOverrideLimitKw?: number | null
    manualOverrideUntil?: Date | string | null
    manualOverrideReason?: string | null
    isActive?: boolean
    lastSignalValue?: number | null
    lastSignalAt?: Date | string | null
    lastLimitSetAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SiteUpdateWithoutEdfRegionInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cpoConnection?: CpoConnectionUpdateOneRequiredWithoutSitesNestedInput
  }

  export type SiteUncheckedUpdateWithoutEdfRegionInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpoConnectionId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SiteUncheckedUpdateManyWithoutEdfRegionInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpoConnectionId?: StringFieldUpdateOperationsInput | string
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    maxCapacityKw?: NullableFloatFieldUpdateOperationsInput | number | null
    currentLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    reducedLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideLimitKw?: NullableFloatFieldUpdateOperationsInput | number | null
    manualOverrideUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    manualOverrideReason?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    lastSignalValue?: NullableIntFieldUpdateOperationsInput | number | null
    lastSignalAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLimitSetAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}