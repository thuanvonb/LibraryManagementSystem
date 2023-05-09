alter table bookspublish add constraint unique_publishment unique key (titleId, publishment);

delimiter |

create trigger after_bookimport_insert
after insert on BookImport
for each row 
  update BooksPublish
  set totalAmount = totalAmount + new.amount
  where BooksPublish.bpId = new.bpId;
|

delimiter ;