const {MaybeM} = require('./monads.js')

exports.if = cond => f1 => f2 => cond ? f1 : f2

exports.sequenceMaybe = monads => {
  let out = MaybeM.pure([])
  let binder = monad => val => {
    if (monad.isNothing)
      return monad
    val.push(monad.data)
    return MaybeM.pure(val)
  }

  return monads.reduce((accM, monad) => accM.bind(binder(monad)), out);
}

exports.on = f => g => h => x => f(g(x))(h(x))

exports.flip = f => x => y => f(y)(x)
exports.starling = f => g => t => f(t)(g(t))