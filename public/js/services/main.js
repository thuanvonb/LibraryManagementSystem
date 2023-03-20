// const socket = io('/admin')

$(".item").click(function(e) {
  let target = $(this)
  if (target.hasClass('active'))
    return;
  $(".item").removeClass('active')
  $(".category").removeClass('active')
  target.addClass('active')
  if (target.prop('tagName') == 'LI')
    target.parent().parent().addClass('active')
})

$(".cat_header").click(function(e) {
  let target = $(this).parent()
  if (target.hasClass('expand'))
    target.children('ul').slideUp(300)
  else
    target.children('ul').slideDown(300)
  if (!target.hasClass('item'))
    target.toggleClass('expand')
})  