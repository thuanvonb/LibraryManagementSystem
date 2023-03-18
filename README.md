# Installation guide
### Prerequisites:
  1. You need to install **nodejs with npm**.
  2. You need to install **mysql** and set it up.
  
### Installation:
  1. Run the file `install.bat` or run the command `npm install` in the terminal.
  2. Open `mysql` and run the file `createTables.sql`.
  3. Add your staff entry to database by following the guide in the next section.
  4. In the file `database/db.js`, at line 5, change the string `"username"` and `"password"` corresponding to your username and password of your mysql user.
  5. Run the file `run.bat`, or run the command `run` or `npm start` to start the web. Then, go to `localhost:7000` to open the web.
  6. If you've followed the guide below, you can now use your username and password that you added to the table to login as a staff at `localhost:7000/admin_Iogin_4365`


# Adding your staff entry
### Prerequisites:
  - Assuming you followed the guide above, you'd have had `nodejs` and `mysql`.

### Instructions:
  1. Open the terminal and go to the `database` folder.
  2. Run `node gimmePwd.js yourpassword` to get the hashed version of your password. (Please note that your password need to have at least 8 characters)
  3. Add one row to `Staff` table using the hashed password, alongside with your username, staff identity number and name. Permission field is set to 31. Other fields are optional and would (supposedly) have no impact on the web.
