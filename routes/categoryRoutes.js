const router = require("express").Router();

const knex = require('knex');
const knexConfig = require('../knexfile'); // Knex yapılandırma dosyasını içe aktarın

const db = knex(knexConfig.development); // Knex yapılandırma dosyasındaki bir ortamı seçin (örneğin, development)



  router.get('/', (req, res) => {
    // Tüm ürünleri çekme
       db.select('*').from('category').orderBy('id', 'asc')
       .then((category) => {
         res.status(200).json(category);
       })
       .catch((error) => {
         console.error(error);
         res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
       });
  });
  //************************************************************************************************************************************ */
  
  router.get('/:id', (req, res) => {
      const {id} = req.params;

      db.select('*').from('category').where({ id: id })
       .then((category) => {
         res.status(200).json(category);
       })
       .catch((error) => {
         console.error(error);
         res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
       });
    });
  //************************************************************************************************************************************ */
  
  router.post('/', (req, res) => {
     // POST verilerini alın
    const postData = req.body;

         // Knex ile "category" tablosuna veri ekleyin
         db('category')
         .insert(postData)
         .returning('*') // Eklenen veriyi geri döndürün
         .then((newProduct) => {
           res.status(201).json(newProduct[0]); // Yeni ürünü yanıt olarak gönderin
         })
         .catch((error) => {
           console.error(error);
           res.status(500).json({ error: 'Veri eklenirken bir hata oluştu.' });
         });
    });
  //************************************************************************************************************************************ */


    router.put('/', (req, res) => {
        
        const {id, name} = req.body;
        const updatedcategory = {name: name};
        
        db('category')
          .where({ id: id })
          .update(updatedcategory)
          .then((updatedCount) => {
            if (updatedCount === 1) {
              res.status(200).json({ message: 'Ürün güncellendi.' });
            } else {
              res.status(404).json({ error: 'Ürün bulunamadı veya güncellenemedi.' });
            }
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Veri güncelleme işlemi sırasında bir hata oluştu.' });
          });

    })
  //************************************************************************************************************************************ */


    router.delete('/:id', (req, res) => {
        // Belirli bir ürünü silme
      const {id} = req.params; // Silinecek ürünün ID'si      

      db('category')
        .where({ id: id })
        .del()
        .then((deletedCount) => {
          if (deletedCount === 1) {
            res.status(200).json({ message: 'Ürün silindi.' });
          } else {
            res.status(404).json({ error: 'Ürün bulunamadı veya silinemedi.' });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Veri silme işlemi sırasında bir hata oluştu.' });
        });
    })

   module.exports = router
 
  
  