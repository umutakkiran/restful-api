const router = require("express").Router();
const schedule = require('node-schedule');
const knex = require('knex');
const knexConfig = require('../knexfile'); // Knex yapılandırma dosyasını içe aktarın

const db = knex(knexConfig.development); // Knex yapılandırma dosyasındaki bir ortamı seçin (örneğin, development)



router.get('/', (req, res) => {
  // Tüm ürünleri çekme
  db.select('*').from('offer')
    .then((offer) => {
      res.status(200).json(offer);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */

router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('offer').where({ id: id })
    .then((offer) => {
      res.status(200).json(offer);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */

router.get('/receiver/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('offer').where({ receiver_id: id })
    .then((offer) => {
      res.status(200).json(offer);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/negotiater/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('offer').where({ negotiater_id: id })
    .then((offer) => {
      res.status(200).json(offer);
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

  // Knex ile "offer" tablosuna veri ekleyin
  db('offer')
    .insert({
      receiver_id: postData.receiver_id,
      negotiater_id: postData.negotiater_id,
      product_id: postData.product_id,
      product_name: postData.product_name,
      product_image: postData.product_image,
      description: postData.description,
      status: postData.status,
      receiver_accept_status: postData.receiver_accept_status,
      negotiater_accept_status: postData.negotiater_accept_status,
      offeredProductsIds: JSON.stringify(postData.offeredProductsIds), // JSONB sütununa uygun formatta veriyi ekleyin
      createdTime: postData.createdTime,
      updatedTime: postData.updatedTime
    })
    .returning('*') // Eklenen veriyi geri döndürün
    .then((newProduct) => {
      res.status(201).json(newProduct[0]); // Yeni ürünü yanıt olarak gönderin
      // 24 saat sonra silmek için zamanlanmış görevi ayarla
      schedule.scheduleJob(new Date(Date.now() + 0.1 * 60 * 60 * 1000), () => {
        // Kontrol et: Eğer status "1" ise silme
        if (newProduct[0].status === "1") {
          console.log(`Kayıt ${newProduct[0].id} silinmedi çünkü anlaşma başarılı.`);
          return;
        } else {
          db('offer')
            .where({ id: newProduct[0].id }) // Silinecek kaydı belirtin
            .del() // Kaydı sil
            .then(() => {
              console.log(`Kayıt ${newProduct[0].id} başarıyla silindi.`);
            })
            .catch((error) => {
              console.error(`Kayıt silinirken bir hata oluştu: ${error}`);
            });
        }
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri eklenirken bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */


router.put('/', (req, res) => {

  const { id, name } = req.body;
  const updatedoffer = { name: name };

  db('offer')
    .where({ id: id })
    .update(updatedoffer)
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

router.put('/receiverAccept', (req, res) => {

  const { id, receiver_accept_status, negotiater_accept_status, description } = req.body;

  let updatedoffer

  if (negotiater_accept_status === "1") {
    updatedoffer = { receiver_accept_status: receiver_accept_status, description: description, status: "1" };
  } else {
    updatedoffer = { receiver_accept_status: receiver_accept_status, description: description };
  }

  db('offer')
    .where({ id: id })
    .update(updatedoffer)
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

router.put('/declineOffer', (req, res) => {

  const { id, description } = req.body;

  const updatedoffer = { description: description, status: "2" };

  db('offer')
    .where({ id: id })
    .update(updatedoffer)
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

router.put('/negotiaterAccept', (req, res) => {

  const { id, negotiater_accept_status, receiver_accept_status, description } = req.body;

  let updatedoffer

  if (receiver_accept_status === "1") {
    updatedoffer = { negotiater_accept_status: negotiater_accept_status, description: description, status: "1" };
  } else {
    updatedoffer = { negotiater_accept_status: negotiater_accept_status, description: description };
  }

  db('offer')
    .where({ id: id })
    .update(updatedoffer)
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
  const { id } = req.params; // Silinecek ürünün ID'si      

  db('offer')
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


