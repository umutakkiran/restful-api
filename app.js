const port = 4200;
require("dotenv").config();

const categoryRoutes = require('./routes/categoryRoutes')
const subCategoryRoutes = require('./routes/subCategoryRoutes')
const productRoutes = require('./routes/productRoutes')
const favouriteRoutes = require('./routes/favouriteRoutes')
const offerRoutes = require('./routes/offerRoutes')
const paymentRoutes = require('./routes/payment')
const notificationRoutes = require('./routes/notificationRoutes')
const notificationContentRoutes = require('./routes/notificationContentRoutes')




const express = require('express');
const app = express();
// Middleware
app.use(express.json()); // JSON verileri işlemek için middleware req.body i parse etmek için kullanılır.

// İsteği işlemeden önce çağrılacak middleware updatedTime ve createdTime ları otomatik doldurmak için yapıyorum.
app.use((req, res, next) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

  // Yeni bir kayıt oluşturulduğunda
  if (req.method === 'POST') {
    req.body.createdTime = formattedDate;
    req.body.updatedTime = formattedDate;
  }
  // Bir kayıt güncellendiğinde
  else if (req.method === 'PUT') {
    req.body.updatedTime = formattedDate;
  }

  // Bir sonraki middleware veya route'a geç
  next();
});

// Statik dosyaları (örneğin, HTML dosyaları) sunmak için 'public' dizinini kullanın
app.use(express.static('public'));

app.use('/categories', categoryRoutes)
app.use('/subcategories', subCategoryRoutes)
app.use('/products', productRoutes)
app.use('/favourites', favouriteRoutes)
app.use('/offers', offerRoutes)
app.use('/payment', paymentRoutes)
app.use('/notifications', notificationRoutes)
app.use('/notificationcontents', notificationContentRoutes)







// Ana sayfa endpoint'i
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API'yi dinlemeye başlayın
app.listen(port, () => {
  try {
    console.log(`API çalışıyor: http://localhost:${port}`);
  } catch (error) {
    console.error("API dinlenirken hata oluştu:", error);
  }
});
