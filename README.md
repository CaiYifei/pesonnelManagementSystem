# PersonnelManagementSystem
The login port is localhost:8888.
You have to change MongoDB url to your owns (pesonnelManagementSystem/js/app.js line7: mongoose.connect('mongodb://root:1234@ds151289.mlab.com:51289/cai_test');); otherwise, you cannot run the app properly.
If an employeeis without subordinates removed, all of his information would be deleted directly; otherwise, his position would be remained by creating a new object with new id, new name, original title, original manager and original subordinates. I call it the ghost.
strict one-to-many relationship between manager and subordinates.
The new employee cannot have subordinates.
"title" is job position.
"reportTo" is subordinates.
