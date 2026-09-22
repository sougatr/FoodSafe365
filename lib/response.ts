export function ok(data:any,status=200){return Response.json({data}, {status});}
export function fail(code:string,message:string,status=400){return Response.json({error:{code,message}}, {status});}
