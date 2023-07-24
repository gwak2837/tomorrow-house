import { Fragment } from 'react'

export function applyLineBreak(sentences: string) {
  return sentences
    ?.split('\n')
    .filter((s) => s)
    .map((c, i) => (
      <Fragment key={i}>
        <p>{c}</p>
        <br />
      </Fragment>
    ))
}
