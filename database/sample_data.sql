insert into Parameters values (18, 55, 180, 8, 5, 4, 1000);

insert into PresetPermission (permission, permissionName) values (2, 'Thủ thư'), (12, "Quản lý thư viện"), (16, "Quản lý nhân sự");

insert into Staff (staffId, sName, phone, employmentDate, username, pwd, salt, permission, permissionPreset) values ("000000", "Siêu quản trị", "0000000000", "2023-01-01T07:00:00+07:00", "super_admin", "db4c4cafaf2dc3530e56bc63b07eacaf1235982bf7bfd6f19d02c154d2dcac23e274c739d76c5c17a6980f83", "258f02213d44a4b2be8d81e3", 31, null);

insert into CardInfo (infoId, rName, addr, birthday, email, identityNum) values ("02291484", "Lý Trung Bình", "Bình Định", "2000-02-02", "BinhLT@gmail.com", "324632635");
insert into CardInfo (infoId, rName, addr, birthday, email, identityNum) values ("23293327", "Võ Viết Thuận", "Đà Nẵng", "2003-03-12", "VThuan123@gmail.com", "980780253");
insert into CardInfo (infoId, rName, addr, birthday, email, identityNum) values ("26816151", "Đoàn Nhật Sang", "An Giang", "2003-03-27", "SangDoan3@gmail.com", "856320325");
insert into CardInfo (infoId, rName, addr, birthday, email, identityNum) values ("35774026", "Huỳnh Mai Cao Nhân", "Bình Định", "2003-03-01", "Nhan@gmail.com", "807802525");
insert into CardInfo (infoId, rName, addr, birthday, email, identityNum) values ("52338676", "Phạm Nguyễn Hà Vy", "Sóc Trăng", "2003-11-23", "HaVy@gmail.com", "463263459");

insert into ReaderCard (cardId, infoId, readerType, issueDate, validUntil, debt, userUUID, staffId) values ("02291484", "02291484", "Thường", "2023-04-25", "2023-11-08", "0", null, null);
insert into ReaderCard (cardId, infoId, readerType, issueDate, validUntil, debt, userUUID, staffId) values ("23293327", "23293327", "Thường", "2023-06-10", "2023-12-07", "0", null, null);
insert into ReaderCard (cardId, infoId, readerType, issueDate, validUntil, debt, userUUID, staffId) values ("26816151", "26816151", "HSSV", "2023-06-14", "2023-12-11", "0", null, null);
insert into ReaderCard (cardId, infoId, readerType, issueDate, validUntil, debt, userUUID, staffId) values ("35774026", "35774026", "HSSV", "2023-01-01", "2023-12-09", "0", null, null);
insert into ReaderCard (cardId, infoId, readerType, issueDate, validUntil, debt, userUUID, staffId) values ("60557041", "52338676", "HSSV", "2023-06-13", "2021-01-07", "0", null, null);

insert into Author (authorId, aName) values ("1", "Macmart");
insert into Author (authorId, aName) values ("2", "Joseph Conlon");
insert into Author (authorId, aName) values ("3", "Thạch Lam");
insert into Author (authorId, aName) values ("4", "Paulo Coelho");
insert into Author (authorId, aName) values ("5", "Simon Singh");
insert into Author (authorId, aName) values ("6", "The Windy");
insert into Author (authorId, aName) values ("7", "Nguyễn Nhật Ánh");
insert into Author (authorId, aName) values ("8", "Robert Cecil Martin");
insert into Author (authorId, aName) values ("9", "Nguyễn Văn Khánh");
insert into Author (authorId, aName) values ("10", "IIG Viet Nam");

insert into Genre (genreId, gName) values ("1", "Tản văn");
insert into Genre (genreId, gName) values ("2", "Sách khoa học");
insert into Genre (genreId, gName) values ("3", "Truyện ngắn");
insert into Genre (genreId, gName) values ("4", "Tiểu thuyết");
insert into Genre (genreId, gName) values ("5", "Sách tiếng anh");
insert into Genre (genreId, gName) values ("6", "Sách tin học");
insert into Genre (genreId, gName) values ("7", "Sách lịch sử");

insert into BookTitle (titleId, bName, genreId, isbn) values ("1", "Một cuốn sách trầm cảm", "1", "9786043976571");
insert into BookTitle (titleId, bName, genreId, isbn) values ("2", "Tại sao lý thuyết dây?", "2", "9786041133082");
insert into BookTitle (titleId, bName, genreId, isbn) values ("3", "Gió lạnh đầu mùa", "3", "9786046976424");
insert into BookTitle (titleId, bName, genreId, isbn) values ("4", "Nhà giả kim", "4", "9786045372043");
insert into BookTitle (titleId, bName, genreId, isbn) values ("5", "Mật mã - từ cổ điển đến điện từ", "2", "9781857028799");
insert into BookTitle (titleId, bName, genreId, isbn) values ("6", "Tự học 2000 từ vựng Tiếng Anh theo chủ đề", "5", "9786043210552");
insert into BookTitle (titleId, bName, genreId, isbn) values ("7", "Mắt biếc", "4", "9786041140783");
insert into BookTitle (titleId, bName, genreId, isbn) values ("8", "Clean Code", "6", "9780132350884");
insert into BookTitle (titleId, bName, genreId, isbn) values ("9", "Việt Nam 1919-1930 Thời Kỳ Tìm Tòi Và Định Hướng", "7", "9786049850059");
insert into BookTitle (titleId, bName, genreId, isbn) values ("10", "IC3 GS5 - Máy Tính Căn Bản", "6", "9786043352313");

insert into BookAuthor (titleId, authorId) values ("1", "1");
insert into BookAuthor (titleId, authorId) values ("2", "2");
insert into BookAuthor (titleId, authorId) values ("3", "3");
insert into BookAuthor (titleId, authorId) values ("4", "4");
insert into BookAuthor (titleId, authorId) values ("5", "5");
insert into BookAuthor (titleId, authorId) values ("6", "6");
insert into BookAuthor (titleId, authorId) values ("7", "7");
insert into BookAuthor (titleId, authorId) values ("8", "8");
insert into BookAuthor (titleId, authorId) values ("9", "9");
insert into BookAuthor (titleId, authorId) values ("10", "10");

insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("1", "1", "1", "2023", "11", "104000", "1");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("2", "2", "1", "2019", "10", "140000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("3", "3", "1", "2021", "5", "42000", "3");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("4", "4", "1", "2013", "5", "79000", "4");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("5", "5", "1", "2018", "10", "240000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("6", "6", "1", "2017", "3", "65000", "5");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("7", "7", "2", "2019", "3", "110000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("8", "7", "3", "2022", "5", "43000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("9", "8", "1", "2023", "5", "258000", "6");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("10", "9", "1", "2019", "5", "115000", "7");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("11", "10", "1", "2020", "5", "65000", "8");

insert into Publisher (publisherId, pName) values ("1", "Nhà xuất bản Thanh niên");
insert into Publisher (publisherId, pName) values ("2", "Nhà xuất bản trẻ");
insert into Publisher (publisherId, pName) values ("3", "Nhà xuất bản văn học");
insert into Publisher (publisherId, pName) values ("4", "Nhà xuất bản Hội nhà văn");
insert into Publisher (publisherId, pName) values ("5", "Nhà xuất bản ĐHQG Hà Nội");
insert into Publisher (publisherId, pName) values ("6", "Nhà xuất bản Dân trí");
insert into Publisher (publisherId, pName) values ("7", "Nhà xuất bản Tri thức");
insert into Publisher (publisherId, pName) values ("8", "Nhà xuất bản Tổng hợp Tp. HCM");

insert into BookImport (importId, bpId, amount, staffId, importDate) values ("1", "1", "11", "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("2", "2", "10", "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("3", "3", "5", "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("4", "4", "5", "000000", "2022-07-01");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("5", "5", "1", "000000", "2022-07-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("6", "6", "1", "000000", "2022-07-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("7", "7", "3", "000000", "2021-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("8", "7", "5", "000000", "2023-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("9", "8", "5", "000000", "2023-06-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("10", "9", "1", "000000", "2023-07-11");
insert into BookImport (importId, bpId, amount, staffId, importDate) values ("11", "10", "5", "000000", "2023-07-11");


insert into Book (bookId, importId, available, stateDesc) values ("001010001", "1", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010002", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010003", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010009", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010010", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010011", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010012", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010013", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010014", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010015", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("001010105", "1", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010003", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010004", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010005", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010006", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010007", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010008", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010016", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010017", "2", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010018", "2", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010019", "2", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("002010020", "2", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("003010021", "3", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("003010022", "3", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("003010023", "3", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("003010024", "3", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("003010025", "3", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("004010047", "4", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("004010048", "4", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("004010049", "4", 0, "");
insert into Book (bookId, importId, available, stateDesc) values ("004010050", "4", 1, "");
insert into Book (bookId, importId, available, stateDesc) values ("004010051"," 4", 0, "");
 
insert into Borrowing (borrowId, cardId, borrowDate, dueDate, staffId) values ("1", "02291484", "2023-05-16", "2023-05-19", "000000");
insert into Borrowing (borrowId, cardId, borrowDate, dueDate, staffId) values ("2", "02291484", "2023-03-15", "2023-03-18", "000000");
insert into Borrowing (borrowId, cardId, borrowDate, dueDate, staffId) values ("3", "23293327", "2023-05-20", "2023-05-22", "000000");
insert into Borrowing (borrowId, cardId, borrowDate, dueDate, staffId) values ("4", "23293327", "2023-05-20", "2023-05-24", "000000");
insert into Borrowing (borrowId, cardId, borrowDate, dueDate, staffId) values ("5", "26816151", "2023-06-14", "2023-06-18", "000000");

insert into BorrowingContents (borrowId, bookId) values ("1", "001010001");
insert into BorrowingContents (borrowId, bookId) values ("2", "001010010");
insert into BorrowingContents (borrowId, bookId) values ("3", "004010048");
insert into BorrowingContents (borrowId, bookId) values ("4", "003010024");
insert into BorrowingContents (borrowId, bookId) values ("5", "002010004");
insert into BorrowingContents (borrowId, bookId) values ("6", "004010033");
insert into BorrowingContents (borrowId, bookId) values ("7", "004010036");
insert into BorrowingContents (borrowId, bookId) values ("8", "005010038");
insert into BorrowingContents (borrowId, bookId) values ("9", "005010039");
insert into BorrowingContents (borrowId, bookId) values ("10", "007010045");
insert into BorrowingContents (borrowId, bookId) values ("11", "009010048");
insert into BorrowingContents (borrowId, bookId) values ("12", "010010050");

insert into Returning (returnId, cardId, returnDate, overdueFine, debtAtTime, staffId) values ("1", "02291484", "2023-05-18", "0", "0", "000000");
insert into Returning (returnId, cardId, returnDate, overdueFine, debtAtTime, staffId) values ("2", "02291484", "2023-05-17", "0", "0", "000000");
insert into Returning (returnId, cardId, returnDate, overdueFine, debtAtTime, staffId) values ("3", "23293327", "2023-05-23", "0", "0", "000000");
insert into Returning (returnId, cardId, returnDate, overdueFine, debtAtTime, staffId) values ("4", "23293327", "2023-05-22", "297000", "297000", "000000");
insert into Returning (returnId, cardId, returnDate, overdueFine, debtAtTime, staffId) values ("5", "26816151", "2023-06-14", "0", "0", "000000");

insert into ReturningContents (returnId, borrowId, bookId, isLost) values ("1", "1", "001010001", 0);
insert into ReturningContents (returnId, borrowId, bookId, isLost) values ("2", "2", "001010010", 0);
insert into ReturningContents (returnId, borrowId, bookId, isLost) values ("3", "3", "004010048", 0);
insert into ReturningContents (returnId, borrowId, bookId, isLost) values ("4", "4", "003010024", 1);
insert into ReturningContents (returnId, borrowId, bookId, isLost) values ("5", "5", "002010004", 0);

insert into FineInvoice (invoiceId, cardId, paid, remaining, staffId, invoiceDate) values ("1", "23293327", "280000", "17000", "000000", "2023-06-23");
insert into FineInvoice (invoiceId, cardId, paid, remaining, staffId, invoiceDate) values ("2", "23293327", "17000", "0", "000000", "2023-06-23");
