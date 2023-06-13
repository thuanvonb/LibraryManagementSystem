insert into Parameters values (18, 55, 180, 8, 5, 4, 1000);

insert into PresetPermission (permission, permissionName) values (2, 'Thủ thư'), (12, "Quản lý thư viện"), (16, "Quản lý nhân sự");

insert into Staff (staffId, sName, phone, employmentDate, username, pwd, salt, permission, permissionPreset) values ("000000", "Siêu quản trị", "0000000000", "2023-01-01T07:00:00+07:00", "super_admin", "db4c4cafaf2dc3530e56bc63b07eacaf1235982bf7bfd6f19d02c154d2dcac23e274c739d76c5c17a6980f83", "258f02213d44a4b2be8d81e3", 31, null);

insert into CardInfor (infoTD, rName, addr, brthday, email, identityNum) values ("02570056", "Hoàng Ngô Thảo Nguyên", "Phú Yên", "2003/02/23", "HoangNguyenNgo@gmail.com", "324632635");
insert into CardInfor (infoTD, rName, addr, brthday, email, identityNum) values ("20815171", "Võ Viết Thuận", "Đà Nẵng", "2003/03/12", "VThuan123@gmail.com", "980780253");
insert into CardInfor (infoTD, rName, addr, brthday, email, identityNum) values ("39313121", "Đoàn Nhật Sang", "Bình Định", "2003/03/21", "SangDoan3@gmail.com", "856320325");

insert into ReaderCard (cardID, infoTD, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("02570056", "02570056", "HSSV", "2023/06/10", "2023/12/10", "0", null, null)
insert into ReaderCard (cardID, infoTD, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("20815171", "20815171", "HSSV", "2023/06/10", "0", "2023/12/07", null, null)
insert into ReaderCard (cardID, infoTD, readerType, issueDate, validUntil, debt, userUUID, staffID) values ("39313121", "39313121", "HSSV", "2023/06/10", "0", "2023/12/07", null, null)
