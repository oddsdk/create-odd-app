import fs from 'fs'

const makeDir = (
  root: string,
  options = { recursive: true }
): Promise<void> => {
  return fs.promises.mkdir(root, options)
}

export default makeDir
