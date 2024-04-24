const router = require("express").Router();

const knex = require('knex');
const knexConfig = require('../knexfile'); // Knex yapılandırma dosyasını içe aktarın

const db = knex(knexConfig.development); // Knex yapılandırma dosyasındaki bir ortamı seçin (örneğin, development)



  router.get('/', (req, res) => {
    // Tüm ürünleri çekme
       db.select('*').from('notificationInfo').orderBy('id', 'asc')
       .then((notificationInfo) => {
         res.status(200).json(notificationInfo);
       })
       .catch((error) => {
         console.error(error);
         res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
       });
  });
  //************************************************************************************************************************************ */
  
  router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.select('*')
        .from('notificationInfo')
        .where({ userId: id })
        .orderBy('createdTime', 'desc') // createdTime'a göre sıralama, en yeni en başa gelecek
        .limit(1) // Sadece en üstteki, yani en yeni bildirimi alacak
        .then((notificationInfo) => {
            res.status(200).json(notificationInfo);
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
    const { userId, pushToken } = postData;

    // Belirli bir userId'ye sahip kaydı kontrol et
    db('notificationInfo')
        .where('pushToken', pushToken)
        .then(existingRecord => {
            if (existingRecord.length > 0) {
                // Kayıt bulundu, pushToken değerini güncelle
                return db('notificationInfo')
                    .where('pushToken', pushToken)
                    .update({ userId, updatedTime: new Date() }, ['*'])
                    .then(updatedRecord => {
                        res.status(200).json(updatedRecord[0]); // Güncellenen kaydı yanıt olarak gönder
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: 'Veri güncellenirken bir hata oluştu.' });
                    });
            } else {
                // Kayıt bulunamadı, yeni bir kayıt ekle
                return db('notificationInfo')
                    .insert({ userId, pushToken, updatedTime: new Date(), createdTime: new Date() })
                    .returning('*')
                    .then(newRecord => {
                        res.status(201).json(newRecord[0]); // Yeni kaydı yanıt olarak gönder
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: 'Veri eklenirken bir hata oluştu.' });
                    });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Veriye erişilirken bir hata oluştu.' });
        });
});
  //************************************************************************************************************************************ */


    router.put('/', (req, res) => {
        
        const {id, name} = req.body;
        const updatednotificationInfo = {name: name};
        
        db('notificationInfo')
          .where({ id: id })
          .update(updatednotificationInfo)
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

      db('notificationInfo')
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
 
  
  