import { Sequelize } from "sequelize";

import db from "../config/Database.js";

const {DataTypes} = Sequelize;

const User = db.define('users', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    refresh_token: DataTypes.TEXT,
}, {
    freezeTableName:true
});

export default User;