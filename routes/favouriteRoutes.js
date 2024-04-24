const router = require("express").Router();

const knex = require('knex');
const knexConfig = require('../knexfile'); // Knex yapılandırma dosyasını içe aktarın

const db = knex(knexConfig.development); // Knex yapılandırma dosyasındaki bir ortamı seçin (örneğin, development)



router.get('/', (req, res) => {
  // Tüm ürünleri çekme
  db.select('*').from('favourite')
    .then((favourite) => {
      res.status(200).json(favourite);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */

router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('favourite').where({ userId: id })
    .then((favourite) => {
      res.status(200).json(favourite);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/getproducts/:id', (req, res) => {
  const { id } = req.params;

  // Önce favori ürünleri çek
  db.select('*').from('favourite').where({ userId: id })
    .then((favourites) => {
      // Favourite tablosundan çekilen ürünlerin product_id'lerini al
      const productIds = favourites.map(favourite => favourite.product_id);

      // Product tablosundan ilgili product_id'lerle eşleşen ürünleri çek
      return db.select('*').from('product').whereIn('id', productIds);
    })
    .then((products) => {
      res.status(200).json(products);
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

  // Knex ile "favourite" tablosuna veri ekleyin
  db('favourite')
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

router.post('/delete', (req, res) => {
  // Belirli bir ürünü silme
  const { userId, product_id } = req.body; // Silinecek ürünün ID'si      

  db('favourite')
    .where({ userId, product_id })
    .del()
    .then((deletedCount) => {
      if (deletedCount === 1) {
        res.status(200).json({ message: 'Ürün silindi.' });
      } else {
        res.status(404).json({ error: 'Ürün bulunamadı veya silinemedi.' });
      }
    })
    .catch((error) => {
      console.error('Veri silme hatası:', error); // Hata mesajını logla
      res.status(500).json({ error: 'Veri silme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */


router.put('/', (req, res) => {

  const { id, name } = req.body;
  const updatedfavourite = { name: name };

  db('favourite')
    .where({ id: id })
    .update(updatedfavourite)
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


router.delete('/', (req, res) => {
  // Belirli bir ürünü silme
  const { userId, product_id } = req.body; // Silinecek ürünün ID'si      

  db('favourite')
    .where({ userId, product_id })
    .del()
    .then((deletedCount) => {
      if (deletedCount === 1) {
        res.status(200).json({ message: 'Ürün silindi.' });
      } else {
        res.status(404).json({ error: 'Ürün bulunamadı veya silinemedi.' });
      }
    })
    .catch((error) => {
      console.error('Veri silme hatası:', error); // Hata mesajını logla
      res.status(500).json({ error: 'Veri silme işlemi sırasında bir hata oluştu.' });
    });
})

module.exports = router


