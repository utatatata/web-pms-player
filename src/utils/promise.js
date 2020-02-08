const bind = f => xs => Promise.all(xs.map(f))

export { bind }
