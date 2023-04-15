class MaybeM {
  constructor(data, isNothing=false) {
    this.data = data;
    this.nothing = isNothing
  }

  static pure(data) {
    return new MaybeM(data)
  }

  static error(err=undefined) {
    return new MaybeM(undefined, true)
  }

  assert(verifyF) {
    if (this.nothing)
      return this
    if (!verifyF(this.data))
      return MonadM.error()
    return this
  }

  fmap(mapF) {
    if (this.nothing)
      return this
    return MaybeM.pure(mapF(this.data))
  }

  bind(monadF) {
    if (this.nothing)
      return this
    return monadF(this.data);
  }

  pass(monadNext) {
    if (this.nothing)
      return this
    return monadNext;
  }

  get isNothing() {
    return this.nothing
  }

  static fromEither(eitherM) {
    if (eitherM.isRight)
      return MonadM.pure(eitherM.data)
    return MonadM.error()
  }

  static lift(func) {
    return dataM => {
      try {
        return dataM.bind(func)
      } catch (e) {
        return MonadM.error()
      }
    }
  }
}


class EitherM {
  constructor(data, isRight=true) {
    this.data = data;
    this.isRight = isRight;
  }

  static pure(data) {
    return new EitherM(data);
  }

  static error(data) {
    return new EitherM(data, false);
  }

  assert(verifyF, errLog) {
    if (!this.isRight)
      return this
    if (!verifyF(this.data))
      return EitherM.error(errLog)
    return this
  }

  fmap(mapF) {
    if (!this.isRight)
      return this
    return EitherM.pure(mapF(this.data))
  }

  bind(monadF) {
    if (!this.isRight)
      return this
    return monadF(this.data)
  }

  pass(monadNext) {
    if (!this.isRight)
      return this
    return monadNext
  }

  then(resolve, reject) {
    if (this.isRight)
      return resolve(this.data)
    if (reject)
      return reject(this.data);
    return this
  }

  catch(reject) {
    if (!this.isRight)
      return reject(this.data)
    return this
  }

  static fromMaybe(maybeM, ifError) {
    if (maybeM.isNothing)
      return EitherM.error(ifError)
    return EitherM.pure(maybeM.data)
  }

  static lift(func) {
    return dataM => {
      try {
        return dataM.bind(func)
      } catch (err) {
        return EitherM.error(err)
      }
    }
  }
}

exports.MaybeM = MaybeM
exports.EitherM = EitherM
