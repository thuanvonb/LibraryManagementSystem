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


create trigger after_insert_returning_contents
after insert
on ReturningContents for each row
begin 
    update Book
    set available = 1
    where bookId = new.bookId;
end$$

delimiter ;