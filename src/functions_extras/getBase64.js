import fs from 'fs';
import path from 'path';

export async function getBase64(filename_of_image) {
  const filePath = path.join('./imagenes_productos', filename_of_image);
  console.log(filePath)
  let base64Image = ''
  await fs.readFile(filePath, (err, data) => {
    if (err) {
       console.log(err)
       return null
    }
    
    // Encode the file to base64
  base64Image = data.toString('base64');
  console.log(base64Image)

});
  return base64Image;
}
