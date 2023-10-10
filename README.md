# Installation guide
### Prerequisites:
  1. You need to install **nodejs with npm**.
  2. You need to install **mysql** and set it up.
  
### Installation:
  1. Run the file `install.bat` or run the command `npm install` in the terminal.
  2. Open `mysql` and run these files (in order) `createTables.sql`, `constraints_triggers.sql`, `sample_data.sql`.
  3. In the file `database/db.js`, at line 6, change the string `"username"` and `"password"` corresponding to your username and password of your mysql user.
  4. Run the file `run.bat`, or run the command `run` or `npm start` to start the web. Then, go to `localhost:7000` to open the web.
  5. One account for super administrator is automatically created with the username `super_admin` and the password `superadmin`. Use it to access the app at `localhost:7000/admin_login_4365`.
