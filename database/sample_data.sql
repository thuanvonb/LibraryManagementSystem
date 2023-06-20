insert into Parameters values (18, 55, 180, 8, 5, 4, 1000);

insert into PresetPermission (permission, permissionName) values (2, 'Thủ thư'), (12, "Quản lý thư viện"), (16, "Quản lý nhân sự");

insert into Staff (staffId, sName, phone, employmentDate, username, pwd, salt, permission, permissionPreset) values ("000000", "Siêu quản trị", "0000000000", "2023-01-01T07:00:00+07:00", "super_admin", "db4c4cafaf2dc3530e56bc63b07eacaf1235982bf7bfd6f19d02c154d2dcac23e274c739d76c5c17a6980f83", "258f02213d44a4b2be8d81e3", 31, null);

insert into CardInfo(infoId, rName, addr, birthday, email, identityNum) values ("02570056", "Hoàng Ngô Thảo Nguyên", "Phú Yên", "2003/02/23", "HoangNguyenNgo@gmail.com", "324632635");
insert into CardInfo(infoId, rName, addr, birthday, email, identityNum) values ("20815171", "Võ Viết Thuận", "Đà Nẵng", "2003/03/12", "VThuan123@gmail.com", "980780253");
insert into CardInfo(infoId, rName, addr, birthday, email, identityNum) values ("39313121", "Đoàn Nhật Sang", "Bình Định", "2003/03/21", "SangDoan3@gmail.com", "856320325");

insert into ReaderCard (cardID, infoId, readerType, validUntil, issueDate, debt, userUUID, staffID) values ("02570056", "02570056", "HSSV", "2021/12/10", "2020/12/7", "0", null, null);
insert into ReaderCard (cardID, infoId, readerType, validUntil, issueDate, debt, userUUID, staffID) values ("20815171", "20815171", "HSSV", "2021/06/10", "2020/12/7", "0", null, null);
insert into ReaderCard (cardID, infoId, readerType, validUntil, issueDate, debt, userUUID, staffID) values ("39313121", "39313121", "HSSV", "2021/06/10", "2020/12/7", "0", null, null);

insert into Author (authorId, aName) values (1, "Macmart");
insert into Author (authorId, aName) values (2, "Joseph Conlon");
insert into Author (authorId, aName) values (3, "Thạch Lam");
insert into Author (authorId, aName) values (4, "Paulo Coelho");
insert into Author (authorId, aName) values (5, "Simon Singh");
insert into Author (authorId, aName) values (6, "The Windy");
insert into Author (authorId, aName) values (7, "Nguyễn Nhật Ánh");
insert into Author (authorId, aName) values (8, "Robert Cecil Martin");
insert into Author (authorId, aName) values (9, "Nguyễn Văn Khánh");
insert into Author (authorId, aName) values (10, "IIG Viet Nam");
insert into Author (authorId, aName) values (11, "Hãy xoá tôi");


insert into Genre (genreId, gName) values (1, "Tản văn");
insert into Genre (genreId, gName) values (2, "Sách khoa học");
insert into Genre (genreId, gName) values (3, "Truyện ngắn");
insert into Genre (genreId, gName) values (4, "Tiểu thuyết");
insert into Genre (genreId, gName) values (5, "Sách tiếng anh");
insert into Genre (genreId, gName) values (6, "Sách tin học");
insert into Genre (genreId, gName) values (7, "Sách lịch sử");
insert into Genre (genreId, gName) values (8, "Hãy xoá tôi");

insert into Publisher (publisherId, pName) values (1, "Nhà xuất bản Thanh niên");
insert into Publisher (publisherId, pName) values (2, "Nhà xuất bản trẻ");
insert into Publisher (publisherId, pName) values (3, "Nhà xuất bản văn học");
insert into Publisher (publisherId, pName) values (4, "Nhà xuất bản Hội nhà văn");
insert into Publisher (publisherId, pName) values (5, "Nhà xuất bản ĐHQG Hà Nội");
insert into Publisher (publisherId, pName) values (6, "Nhà xuất bản Dân trí");
insert into Publisher (publisherId, pName) values (7, "Nhà xuất bản Tri thức");
insert into Publisher (publisherId, pName) values (8, "Nhà xuất bản Tổng hợp Tp. HCM");

insert into BookTitle (titleId, bName, genreId, isbn) values (1, "Một cuốn sách trầm cảm", 1, "9786043976571");
insert into BookTitle (titleId, bName, genreId, isbn) values (2, "Tại sao lý thuyết dây?", 2, "9786041133082");
insert into BookTitle (titleId, bName, genreId, isbn) values (3, "Gió lạnh đầu mùa", 3, "9786046976424");
insert into BookTitle (titleId, bName, genreId, isbn) values (4, "Nhà giả kim", 4, "9786045372043");
insert into BookTitle (titleId, bName, genreId, isbn) values (5, "Mật mã - từ cổ điển đến điện từ", 5, "9781857028799");
insert into BookTitle (titleId, bName, genreId, isbn) values (6, "Tự học 2000 từ vựng Tiếng Anh theo chủ đề", 6, "9786043210552");
insert into BookTitle (titleId, bName, genreId, isbn) values (7, "Mắt biếc", 4, "9786041140783");
insert into BookTitle (titleId, bName, genreId, isbn) values (8, "Clean Code", 6, "9780132350884");
insert into BookTitle (titleId, bName, genreId, isbn) values (9, "Việt Nam 1919-1930 Thời Kỳ Tìm Tòi Và Định Hướng", 7, "9786049850059");
insert into BookTitle (titleId, bName, genreId, isbn) values (10, "IC3 GS5 - Máy Tính Căn Bản", 7, "9786043352313");

insert into BookAuthor (titleId, authorId) values (1, 1);
insert into BookAuthor (titleId, authorId) values (2, 2);
insert into BookAuthor (titleId, authorId) values (3, 3);
insert into BookAuthor (titleId, authorId) values (4, 4);
insert into BookAuthor (titleId, authorId) values (5, 5);
insert into BookAuthor (titleId, authorId) values (6, 6);
insert into BookAuthor (titleId, authorId) values (7, 7);
insert into BookAuthor (titleId, authorId) values (8, 8);
insert into BookAuthor (titleId, authorId) values (9, 9);
insert into BookAuthor (titleId, authorId) values (10, 10);

insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (1, 1, 1, 2023, 0, 104000, 1);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (2, 2, 1, 2019, 0, 140000, 2);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (3, 3, 1, 2021, 0, 42000, 3);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (4, 4, 1, 2013, 0, 79000, 4);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (5, 5, 1, 2018, 0, 240000, 2);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (6, 6, 1, 2017, 0, 65000, 5);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (7, 7, 2, 2019, 0, 110000, 2);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (8, 8, 3, 2022, 0, 43000, 2);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (9, 9, 1, 2023, 0, 258000, 6);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (10, 10, 1, 2019, 0, 115000, 7);
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values (11, 10, 2, 2020, 0, 65000, 8);

insert into BookImport (importId, bpId, amount, staffID, importDate) values (1, 1, 0, "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (2, 2, 0, "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (3, 3, 0, "000000", "2022-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (4, 4, 0, "000000", "2022-07-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (5, 5, 0, "000000", "2022-07-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (6, 6, 0, "000000", "2022-07-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (7, 7, 0, "000000", "2021-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (8, 8, 0, "000000", "2023-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (9, 9, 0, "000000", "2023-06-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (10, 10, 0, "000000", "2023-07-11");
insert into BookImport (importId, bpId, amount, staffID, importDate) values (11, 11, 0, "000000", "2023-07-11");
