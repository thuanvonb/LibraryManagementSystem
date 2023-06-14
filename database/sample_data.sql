insert into Parameters values (18, 55, 180, 8, 5, 4, 1000);

insert into PresetPermission (permission, permissionName) values (2, 'Thủ thư'), (12, "Quản lý thư viện"), (16, "Quản lý nhân sự");

insert into Staff (staffId, sName, phone, employmentDate, username, pwd, salt, permission, permissionPreset) values ("000000", "Siêu quản trị", "0000000000", "2023-01-01T07:00:00+07:00", "super_admin", "db4c4cafaf2dc3530e56bc63b07eacaf1235982bf7bfd6f19d02c154d2dcac23e274c739d76c5c17a6980f83", "258f02213d44a4b2be8d81e3", 31, null);

insert into CardInfor (infoTd, rName, addr, brthday, email, identityNum) values ("02570056", "Hoàng Ngô Thảo Nguyên", "Phú Yên", "2003/02/23", "HoangNguyenNgo@gmail.com", "324632635");
insert into CardInfor (infoTd, rName, addr, brthday, email, identityNum) values ("20815171", "Võ Viết Thuận", "Đà Nẵng", "2003/03/12", "VThuan123@gmail.com", "980780253");
insert into CardInfor (infoTd, rName, addr, brthday, email, identityNum) values ("39313121", "Đoàn Nhật Sang", "Bình Định", "2003/03/21", "SangDoan3@gmail.com", "856320325");

insert into ReaderCard (cardID, infoTd, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("02570056", "02570056", "HSSV", "2023/06/10", "2023/12/10", "0", null, null);
insert into ReaderCard (cardID, infoTd, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("20815171", "20815171", "HSSV", "2023/06/10", "0", "2023/12/07", null, null);
insert into ReaderCard (cardID, infoTd, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("39313121", "39313121", "HSSV", "2023/06/10", "0", "2023/12/07", null, null);

insert into Genre (genreId, gName) values ("1", "Tản văn");
insert into Genre (genreId, gName) values ("2", "Sách khoa học");
insert into Genre (genreId, gName) values ("3", "Truyện ngắn");
insert into Genre (genreId, gName) values ("4", "Tiểu thuyết");
insert into Genre (genreId, gName) values ("5", "Sách tiếng anh");
insert into Genre (genreId, gName) values ("6", "Sách tin học");
insert into Genre (genreId, gName) values ("7", "Sách lịch sử");
insert into Genre (genreId, gName) values ("8", "Sách tin học");
insert into Genre (genreId, gName) values ("9", "Sách lịch sử");
insert into Genre (genreId, gName) values ("10", "Sách tin học");

insert into BookTitle (titleId, bName, genreId, isbn) values ("1", "Một cuốn sách trầm cảm", "Tản văn", "9786043976571");
insert into BookTitle (titleId, bName, genreId, isbn) values ("2", "Tại sao lý thuyết dây?", "Sách khoa học", "9786041133082");
insert into BookTitle (titleId, bName, genreId, isbn) values ("3", "Gió lạnh đầu mùa", "Truyện ngắn", "9786046976424");
insert into BookTitle (titleId, bName, genreId, isbn) values ("4", "Nhà giả kim", "Tiểu thuyết", "9786045372043");
insert into BookTitle (titleId, bName, genreId, isbn) values ("5", "Mật mã - từ cổ điển đến điện từ", "Sách khoa học", "9781857028799");
insert into BookTitle (titleId, bName, genreId, isbn) values ("6", "Tự học 2000 từ vựng Tiếng Anh theo chủ đề", "Sách tiếng anh", "9786043210552");
insert into BookTitle (titleId, bName, genreId, isbn) values ("7", "Mắt biếc", "Tiểu thuyết", "9786041140783");
insert into BookTitle (titleId, bName, genreId, isbn) values ("8", "Clean Code", "Sách tin học", "9780132350884");
insert into BookTitle (titleId, bName, genreId, isbn) values ("9", "Việt Nam 1919-1930 Thời Kỳ Tìm Tòi Và Định Hướng", "Sách lịch sử", "9786049850059");
insert into BookTitle (titleId, bName, genreId, isbn) values ("10", "IC3 GS5 - Máy Tính Căn Bản", "Sách tin học", "9786043352313");

insert into BookAuthor (titleId, authorId) values ("1", "Macmart");
insert into BookAuthor (titleId, authorId) values ("2", "Joseph Conlon");
insert into BookAuthor (titleId, authorId) values ("3", "Thạch Lam");
insert into BookAuthor (titleId, authorId) values ("4", "Paulo Coelho");
insert into BookAuthor (titleId, authorId) values ("5", "Simon Singh");
insert into BookAuthor (titleId, authorId) values ("6", "The Windy");
insert into BookAuthor (titleId, authorId) values ("7", "Nguyễn Nhật Ánh");
insert into BookAuthor (titleId, authorId) values ("8", "Robert Cecil Martin");
insert into BookAuthor (titleId, authorId) values ("9", "Nguyễn Văn Khánh");
insert into BookAuthor (titleId, authorId) values ("10", "IIG Viet Nam");

insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("1", "Một cuốn sách trầm cảm", "Nhà xuất bản Thanh niên", "2023", "11", "104000", "1");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("2", "Tại sao lý thuyết dây?", "Nhà xuất bản Trẻ", "2019", "10", "140000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("3", "Gió lạnh đầu mùa", "Nhà xuất bản Văn học", "2021", "5", "42000", "3");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("4", "Nhà giả kim", "Nhà xuất bản Hội nhà văn", "2013", "5", "79000", "4");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("5", "Mật mã - Từ cổ điển đến lượng tử", "Nhà xuất bản Trẻ", "2018", "10", "240000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("6", "Tự Học 2000 Từ Vựng Tiếng Anh Theo Chủ Đề", "Nhà xuất bản ĐHQG Hà Nội", "2017", "3", "65000", "5");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("7", "Mắt biếc", "Nhà xuất bản Trẻ", "2019", "3", "110000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("8", "Mắt biếc", "Nhà xuất bản Trẻ", "2022", "5", "43000", "2");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("9", "Clean Code", "Nhà xuất bản Dân trí", "2023", "5", "258000", "6");
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("10", "Việt Nam 1919-1930 Thời Kỳ Tìm Tòi Và Định Hướng", "Nhà xuất bản Tri thức", "2019", "5", "115000", "7")
insert into BooksPublish (bpId, titleId, publishment, publishYear, totalAmount, price, publisherId) values ("11", "IC3 GS5 - Máy Tính Căn Bản", "Nhà xuất bản Tổng hợp Tp. HCM", "2020", "5", "65000", "8');

insert into Publisher (publisherId, pName) values ("1", "Nhà xuất bản Thanh niên");
insert into Publisher (publisherId, pName) values ("2', 'Nhà xuất bản trẻ");
insert into Publisher (publisherId, pName) values ("3", "Nhà xuất bản văn học");
insert into Publisher (publisherId, pName) values ("4", "Nhà xuất bản Hội nhà văn");
insert into Publisher (publisherId, pName) values ("5", "Nhà xuất bản ĐHQG Hà Nội");
insert into Publisher (publisherId, pName) values ("6", "Nhà xuất bản Dân trí");
insert into Publisher (publisherId, pName) values ("7", "Nhà xuất bản Tri thức");
insert into Publisher (publisherId, pName) values ("8", "Nhà xuất bản Tổng hợp Tp. HCM");
