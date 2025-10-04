import z from "zod";
import { SignUpValidator } from "../../validators";


export type  sginUpBodyType=z.infer<typeof SignUpValidator.body>
