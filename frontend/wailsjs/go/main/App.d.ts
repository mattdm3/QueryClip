// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function AddDatabase(arg1:string,arg2:string):Promise<void>;

export function GetDatabases():Promise<Array<main.DatabaseConnection>>;

export function GetDatabasesList(arg1:string):Promise<{[key: string]: Array<main.TableInfo>}>;

export function SubmitAIQuery(arg1:string,arg2:string,arg3:string,arg4:string,arg5:number,arg6:number):Promise<Array<{[key: string]: any}>>;

export function SubmitQuery(arg1:string,arg2:string,arg3:number,arg4:number):Promise<Array<{[key: string]: any}>>;

export function TestConnection(arg1:string):Promise<void>;
