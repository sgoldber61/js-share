const pg = require('pg');
const format = require('pg-format');


module.exports = function(pool) {
    return {
        createDoc: (req, res, next) => {
        const queryText = 'INSERT INTO documents ( owner, name, text_content, last_updated) VALUES($1, $2, $3, $4) RETURNING *';
        const values = [req.user.id, req.body.name, '', new Date()];
  
        pool.query(queryText, values).then(result => {
            console.log('data saved')
            res.locals.doc_id = result.rows[0].doc_id;
            next();
          }).catch(err => {
              console.log('end')
            if (err) throw new Error(err);
          });
     },
         addPermittedUsers:  (req, res, next) => {  
         // res.locals.doc_id provides us the doc_id.. which was declared in createDoc
            const values = [];
            //// POSSIBLE BUG 
            const doc_id = res.locals.doc_id ? res.locals.doc_id : req.body.doc_id;
            
            req.body.permitted_users.forEach( email => {
                values.push([doc_id, email])
            })
            const sql = format('INSERT INTO document_permissions (doc_id, permitted_user) VALUES %L', values);

            pool.query(sql).then(result => {
                console.log('permissions granted to' + req.body.permitted_users.length + ' users')
                next();
                }).catch(err => {
                    console.log('caught error')
                if (err) throw new Error(err);
                });
         },


         editDocTitle:  (req, res, next) => {
            console.log('edited doc');
            // assumes req.body.name req.body.doc_id exists from the request
            const queryText = 'UPDATE documents SET name = $1, last_updated=$2 WHERE doc_id = $3';
            const values = [req.body.name, new Date(), req.body.doc_id ]

            pool.query(queryText, values).then(results => {
                console.log('Document name updated');
                next();
            }).catch(err => {
                if (err) throw new Error(err);
            })
            next();
        },



        deletePermittedUsers:  (req, res, next) => {
            // TO DO: seems to persist....
            // assumes client sends in req.body.doc_id
            const queryText = 'DELETE FROM document_permissions WHERE doc_id=$1';
            const values = [req.body.doc_id];
            
            pool.query(queryText, values).then(result =>{
                console.log('permissions revoked')
                next();
              }).catch(err => {
                  console.log('end')
                if (err) throw new Error(err);
              });
            console.log("deleted permissions");
            next();
        },


        saveDocumentContent:  (req, res, next) => {
// sends req.body.text_content 
            const queryText = 'UPDATE documents SET text_content =$1, last_updated= $2 WHERE doc_id=$3 RETURNING *';
            const value = [req.body.text_content, new Date(), req.body.doc_id];
            pool.query(queryText, value).then(result => {
                console.log(result.row)
                // res.locals.text_content = result.row;
                next();
            }).catch(err => {
                console.log('end');
                if (err) throw new Error(err);
            }); 

        },


        getMyDocs:  (req, res, next) => {
            console.log('getting documents');
            res.locals.docs =  {owned: [], permitted: []};
            const ownedDocs = 'SELECT doc_id, owner, name, last_updated FROM documents WHERE owner=$1';
            const user_id = [req.user.id];
            console.log(req.user.id, req.user, "USER COOKIIIIE");
            pool.query(ownedDocs, user_id).then(result => {
                
                res.locals.docs.owned = result.rows;
                console.log(res.locals.docs);
                next();
              }).catch(err => {
                  console.log('end');
                if (err) throw new Error(err);
              }); 
        },
        getPermittedDocs:  (req, res, next) => {
            console.log('getting permitted documents');
            const permittedDocs = ' SELECT documents.doc_id, documents.owner, documents.name, documents.last_updated FROM documents INNER JOIN document_permissions ON document_permissions.doc_id = documents.doc_id WHERE document_permissions.permitted_user=$1';
            const user_email = [req.user.email]; 
            console.log("got permitted documents", req.user.email);
            pool.query(permittedDocs, user_email).then(result => {
                console.log(result.rows)
                res.locals.docs.permitted =  result.rows;
                console.log(res.locals.docs)
                next();
              }).catch(err => {
                  console.log('end');
                if (err) throw new Error(err);
              }); 
        },

        
        getDocText: (req, res, next) => {
            const queryText = 'SELECT text_content,  last_updated FROM documents WHERE doc_id=$1 ';
            console.log(req.params.id, req.params);
            const value = [req.params.id];
            pool.query(queryText, value).then(result => {
                console.log(result.rows[0], "here ate getdoctext")
                if (result.rows[0]){
                    res.locals.text_content = result.rows[0];
                }
                else {
                    res.locals.text_content = "Document not found"
                }
                
                next();
              }).catch(err => {
                  console.log('end, found nothing');
                if (err) throw new Error(err);
              }); 
        }

     }
    


};