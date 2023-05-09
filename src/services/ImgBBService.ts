import axios from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import { AppConfigs } from "../shared/AppConfigs";
import { Logger } from "../utils/Logger";

export default class ImgBBService {
    static readImageBase64(path: string) {
        const imageBuffer = fs.readFileSync(path);
        return Buffer.from(imageBuffer).toString("base64");
    }

    static uploadImageNoExpireAsync(imagePath: string): Promise<string> {
        return new Promise(async function (resolve, reject) {
            try {
                const url = `${AppConfigs.IMGBB_API_URL}?key=${AppConfigs.IMGBB_API_KEY}`;
                const image = ImgBBService.readImageBase64(imagePath);
                const formData = new FormData();
                formData.append("image", image);

                Logger.info("ImgBBService-uploadImageNoExpireAsync-Start");
                const res = await axios.post(url, formData, {
                    headers: { ...formData.getHeaders() },
                });
                Logger.info("ImgBBService-uploadImageNoExpireAsync-Success");

                fs.unlink(imagePath, (err) => {
                    if (err) {
                        throw err;
                    }
                });
                if (res.data.success) {
                    resolve(res.data.data.url);
                } else {
                    reject("Upload error" + res.data);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

//  data: {
//    id: 'HHjD8Cg',
//    title: '8dc9babafac1',
//    url_viewer: 'https://ibb.co/HHjD8Cg',
//    url: 'https://i.ibb.co/vjSxnhz/8dc9babafac1.jpg',
//    display_url: 'https://i.ibb.co/71qJmQy/8dc9babafac1.jpg',
//    size: 323381,
//    time: '1649816264',
//    expiration: '0',
//    is_360: 0,
//    image: {
//  filename: '8dc9babafac1.jpg',
//  name: '8dc9babafac1',
//  mime: 'image/jpeg',
//  extension: 'jpg',
//  url: 'https://i.ibb.co/vjSxnhz/8dc9babafac1.jpg'
//    },
//    thumb: {
//  filename: '8dc9babafac1.jpg',
//  name: '8dc9babafac1',
//  mime: 'image/jpeg',
//  extension: 'jpg',
//  url: 'https://i.ibb.co/HHjD8Cg/8dc9babafac1.jpg'
//    },
//    medium: {
//  filename: '8dc9babafac1.jpg',
//  name: '8dc9babafac1',
//  mime: 'image/jpeg',
//  extension: 'jpg',
//  url: 'https://i.ibb.co/71qJmQy/8dc9babafac1.jpg'
//    },
//    delete_url: 'https://ibb.co/HHjD8Cg/40651c6c9d26d530b225ceb0858d6f00'
//  },
//  success: true,
//  status: 200
//
