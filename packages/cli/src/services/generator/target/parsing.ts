import { HasName, HasFields, Field, HasReaction, ReactionEvent } from './types'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/generic-type-naming */

export const parseName = (name: string): Promise<HasName> => Promise.resolve({ name })

export const parseFields = (fields: Array<string>): Promise<HasFields> =>
  Promise.all(fields.map(parseField)).then((fields) => ({ fields }))

function parseField(rawField: string): Promise<Field> {
  const splitInput = rawField.split(':')
  if (splitInput.length != 2) {
    return Promise.reject(fieldParsingError(rawField))
  } else {
    return Promise.resolve({
      name: splitInput[0],
      type: splitInput[1],
    })
  }
}

export const parseReaction = (rawEvents: Array<string>): Promise<HasReaction> =>
  Promise.all(rawEvents.map(parseReactionEvent)).then((events) => ({
    events,
  }))

const parseReactionEvent = (eventName: string): Promise<ReactionEvent> => Promise.resolve({ eventName })

const fieldParsingError = (field: string): Error =>
  new Error(`Error parsing field ${field}. Fields must be in the form of <field name>:<field type>`)

/**
 * Joins parsers together used to generate target information for generators.
 *
 * @example
 * ```typescript
 * const myEntity: Promise<HasName & HasFields & HasReaction> =
 *   joinParsers(
 *     parseName(entityName),
 *     parseFields(rawFields),
 *     parseReaction(events)
 *   )
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function joinParsers<T extends Promise<any>[]>(
  ...parsers: T
): Promise<TupleToIntersection<{ [K in keyof T]: T[K] extends Promise<infer P> ? P : never }>> {
  return parsers.reduce((promiseA, promiseB) => {
    return promiseA.then((a) => promiseB.then((b) => ({ ...a, ...b })))
  })
}

type TupleToUnion<T> = { [P in keyof T]: T[P] } extends { [K: number]: infer V } ? V : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer I) => void ? I : never
type TupleToIntersection<T> = UnionToIntersection<TupleToUnion<T>>
