const router = require("express").Router();

const knex = require('knex');
const knexConfig = require('../knexfile'); // Knex yapılandırma dosyasını içe aktarın

const db = knex(knexConfig.development); // Knex yapılandırma dosyasındaki bir ortamı seçin (örneğin, development)



router.get('/', (req, res) => {
  // Tüm ürünleri çekme
  db.select('*').from('product').where('isActive', 1).orderBy('id', 'asc')
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */

router.post('/byproduct', (req, res) => {
  const { userId, productId } = req.body;

  db.select('*')
    .from('productViews')
    .where({ userId: userId, product_id: productId })
    .first()
    .then((view) => {
      // Eğer kullanıcı bu ürünü daha önce görüntülemediyse, view bilgisi null olacaktır
      if (!view) {
        // Görüntüleme kaydını productViews tablosuna ekle
        return db('productViews')
          .insert({ userId: userId, product_id: productId })
          .then(() => {
            // Ürün görüntülenme sayısını artır
            return db('product')
              .where({ id: productId })
              .increment('viewCount', 1)
              .then(() => {
                // Ürünü veritabanından al
                return db.select('*').from('product').where({ isActive: 1, id: productId }).first();
              });
          });
      } else {
        // Kullanıcı daha önce bu ürünü ziyaret etmişse, viewCount artırılmaz
        return db.select('*').from('product').where({ isActive: 1, id: productId }).first();
      }
    })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: 'Ürün bulunamadı' });
      }
      res.status(200).json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/byproductname/:name', (req, res) => {
  const { name } = req.params;
  console.log( name)

  let queryBuilder = db.select('*').from('product').where('isActive', 1);

  if (name && name.length <= 2) {
    // Sadece name alanında arama yap
    queryBuilder = queryBuilder.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${name}%`]);
  } else {
    // Hem name hem de description alanında arama yap
    queryBuilder = queryBuilder.where(function() {
      this.whereRaw('LOWER(name) LIKE LOWER(?)', [`%${name}%`])
          .orWhereRaw('LOWER(description) LIKE LOWER(?)', [`%${name}%`]);
    });
  }

  queryBuilder
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/subcategoryname/:name', (req, res) => {
  const { name } = req.params;

  if (!name) {
    return res.status(400).json({ error: 'Arama yapmak için bir isim belirtmelisiniz.' });
  }

  db.select('*')
    .from('subcategory')
    .whereRaw('LOWER(name) LIKE LOWER(?)', [`%${name}%`])
    .then((subcategories) => {
      console.log(subcategories)
      const subcategoryIds = subcategories.filter(subcategory => subcategory.id).map(subcategory => subcategory.id);

      db.select('*')
        .from('product')
        .where('isActive', 1)
        .whereIn('subcategory_id',subcategoryIds)
        .then((products) => {
          res.status(200).json(products);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'Ürünler getirilirken bir hata oluştu.' });
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekilirken bir hata oluştu.' });
    });
});



//************************************************************************************************************************************ */

router.get('/owner/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('product').where({ userId: id })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/bysubcategory/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('product').where({ isActive: 1, subcategory_id: id })
    .then((product) => {
      res.status(200).json(product);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri çekme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.get('/mostliked', (req, res) => {
  const offset = req.query.offset ? parseInt(req.query.offset) : 0; // varsayılan olarak 0
  const limit = req.query.limit ? parseInt(req.query.limit) : 50; // varsayılan olarak 50

  db.select('*').from('product').where('isActive', 1).orderBy('likeCount', 'desc')
    .offset(offset)
    .limit(limit)
    .then((product) => {
      res.status(200).json(product);
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
  postData.isActive = 1;
  postData.likeCount = 0;

  // Knex ile "product" tablosuna veri ekleyin
  db('product')
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


router.put('/owner', (req, res) => {

  const { id, name, description, year, brand, color, status, latitude, longitude,thumbNail, firstImage, secondImage, thirdImage, fourthImage } = req.body;

  // Sadece gelen değerlerle sınırlı bir obje oluştur
  const updatedProduct = {};
  if (name !== undefined) updatedProduct.name = name;
  if (description !== undefined) updatedProduct.description = description;
  if (year !== undefined) updatedProduct.year = year;
  if (brand !== undefined) updatedProduct.brand = brand;
  if (color !== undefined) updatedProduct.color = color;
  if (status !== undefined) updatedProduct.status = status;
  if (latitude !== undefined) updatedProduct.latitude = latitude;
  if (longitude !== undefined) updatedProduct.longitude = longitude;
  if (thumbNail !== undefined) updatedProduct.thumbNail = thumbNail;
  if (firstImage !== undefined) updatedProduct.firstImage = firstImage;
  if (secondImage !== undefined) updatedProduct.secondImage = secondImage;
  if (thirdImage !== undefined) updatedProduct.thirdImage = thirdImage;
  if (fourthImage !== undefined) updatedProduct.fourthImage = fourthImage;

  db('product')
    .where({ id: id })
    .update(updatedProduct)
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


router.put('/likes', (req, res) => {
  const { id, likeCount } = req.body;

  // Veritabanından mevcut ürünü çek
  db('product')
    .where({ id: id })
    .first()
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: 'Ürün bulunamadı.' });
      }

      // Mevcut likeCount değeri ile yeni değeri topla
      const updatedLikeCount = product.likeCount + likeCount;

      // Güncellenmiş ürünü veritabanına kaydet
      return db('product')
        .where({ id: id })
        .update({ likeCount: updatedLikeCount })
        .then((updatedCount) => {
          if (updatedCount === 1) {
            res.status(200).json({ message: 'Ürün güncellendi.' });
          } else {
            res.status(500).json({ error: 'Ürün güncellenemedi.' });
          }
        });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Veri güncelleme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */

router.put('/suspend', (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'Geçersiz güncelleme verisi.' });
  }

  const promises = updates.map((update) => {
    const { id } = update;

    return db('product')
      .where({ id: id })
      .first()
      .then((product) => {
        if (!product) {
          return res.status(404).json({ error: `Ürün ID'si ${id} ile bulunamadı.` });
        }

        return db('product')
          .where({ id: id })
          .update({ isActive: 0 });
      });
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).json({ message: 'Ürünler güncellendi.' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Ürünleri güncelleme işlemi sırasında bir hata oluştu.' });
    });
});

//************************************************************************************************************************************ */

router.put('/unsuspend', (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'Geçersiz güncelleme verisi.' });
  }

  const promises = updates.map((update) => {
    const { id } = update;

    return db('product')
      .where({ id: id })
      .first()
      .then((product) => {
        if (!product) {
          return res.status(404).json({ error: `Ürün ID'si ${id} ile bulunamadı.` });
        }

        return db('product')
          .where({ id: id })
          .update({ isActive: 1 });
      });
  });

  Promise.all(promises)
    .then(() => {
      res.status(200).json({ message: 'Ürünler güncellendi.' });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Ürünleri güncelleme işlemi sırasında bir hata oluştu.' });
    });
});
//************************************************************************************************************************************ */


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // ProductViews tablosundan ilgili ürüne ait girişleri sil
    await db('productViews')
      .where({ product_id: id })
      .del();

    // Favourites tablosundan ilgili ürüne ait girişleri sil
    await db('favourite')
    .where({ product_id: id })
    .del();

    // Product tablosundan ürünü sil
    const deletedProductCount = await db('product')
      .where({ id })
      .del();

    if (deletedProductCount === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı veya silinemedi.' });
    }

    return res.status(200).json({ message: 'Ürün ve ilişkili görüntülemeler başarıyla silindi.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Veri silme işlemi sırasında bir hata oluştu.' });
  }
});

module.exports = router


