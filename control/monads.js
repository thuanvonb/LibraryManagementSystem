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
    try {
      if (!verifyF(this.data))
        return MaybeM.error()
    } catch (e) {
      return MaybeM.error()
    }
    return this
  }

  fmap(mapF) {
    if (this.nothing)
      return this
    try {
      return MaybeM.pure(mapF(this.data))
    } catch (e) {
      return MaybeM.error();
    }
  }

  bind(monadF) {
    if (this.nothing)
      return this
    try {
      return monadF(this.data);
    } catch (e) {
      return MaybeM.error();
    }
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
      return MaybeM.pure(eitherM.data)
    return MaybeM.error()
  }

  static lift(func) {
    return dataM => {
      try {
        return dataM.fmap(func)
      } catch (e) {
        return MaybeM.error()
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
    try {
      if (!verifyF(this.data))
        return EitherM.error(errLog)
    } catch (err) {
      return EitherM.error(err);
    }
    return this
  }

  fmap(mapF) {
    if (!this.isRight)
      return this
    try {
      return EitherM.pure(mapF(this.data))
    } catch (err) {
      return EitherM.error(err)
    }
  }

  bind(monadF) {
    if (!this.isRight)
      return this
    try {
      return monadF(this.data)
    } catch (err) {
      return EitherM.error(err)
    }
  }

  pass(monadNext) {
    if (!this.isRight)
      return this
    return monadNext
  }

  then(resolve, reject) {
    try {
      if (this.isRight)
        return resolve(this.data)
      if (reject)
        return reject(this.data);
    } catch (err) {
      return EitherM.error(err)
    }
    return this
  }

  catch(reject) {
    try {
      if (!this.isRight)
        return reject(this.data)
    } catch (err) {
      return EitherM.error(err)
    }
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
        return dataM.fmap(func)
      } catch (err) {
        return EitherM.error(err)
      }
    }
  }
}

exports.MaybeM = MaybeM
exports.EitherM = EitherM
