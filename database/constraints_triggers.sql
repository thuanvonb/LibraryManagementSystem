alter table bookspublish add constraint unique_publishment unique key (titleId, publishment);

-- create trigger after_bookimport_insert
-- after insert
-- on BookImport for each row 
-- before
--   update BooksPublish
--   set totalAmount = totalAmount + new.amount
--   where BooksPublish.bpId = new.bpId;
-- end$$

delimiter $$
create trigger after_insert_borrowing_contents
after insert 
on BorrowingContents for each row
begin 
    update Book 
    set available = 0
    where bookId = new.bookId;
end$$
delimiter ;
delimiter $$
-- drop trigger after_insert_returning_contents;
create trigger after_insert_returning_contents
after insert
on ReturningContents for each row
begin 
    update Book
    set available = 1
    where bookId = new.bookId and new.isLost = 0;
end$$

delimiter ;

delimiter |

create trigger after_returning_books
after insert on Returning
for each row begin
  update ReaderCard rc
  set debt = debt + new.overdueFine
  where rc.cardId = new.cardId;
end|

create trigger after_issue_invoice
after insert on FineInvoice
for each row begin
  update ReaderCard rc
  set debt = debt - new.paid
  where rc.cardId = new.cardId;
end|

delimiter ;