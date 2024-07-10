import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import router from "./routes/AuthRoutes.js";
import ProductRoute from "./routes/ProductRoutes.js";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors( { credentials:true, origin:'http://localhost:3000'} ));
app.use(cookieParser())
app.use(express.json());
app.use(fileUpload());
app.use(router);
app.use(ProductRoute);
app.use(express.static("public"))

// try {
//     await db.authenticate();
//     await Product.sync();
// } catch (error) {
//     console.log(error);
// }



app.listen(5000, ()=> console.log('Server up and running...'));