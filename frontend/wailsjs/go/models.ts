export namespace main {
	
	export class DatabaseConnection {
	    dbName: string;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseConnection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dbName = source["dbName"];
	    }
	}

}

