// Gán bối cảnh cho từng tranh Lớp 3: [khung cảnh, màu trời]. Cặp này KHÔNG được trùng giữa các tranh
// (build.mjs kiểm tra và báo lỗi nếu trùng). Khung cảnh chọn theo nội dung tranh.
const M = {
  // 01 · Anh Hùng Siêu Thú
  'su-tu': { 'ruc-lua': ['volcanoValley', 'sunset'], 'tieng-gam-song-am': ['canyon', 'day'], 'nang-tang-da': ['peak', 'morning'], 'khien-hoang-gia': ['palaceHall', 'day'], 'bom-anh-sang': ['rainbowHills', 'pink'] },
  ho: { 'tia-chop': ['rainyStreet', 'storm'], 'mong-vuot-laser': ['nightCity', 'night'], 'sieu-toc': ['desert', 'day'], 'bang-gia': ['aurora', 'night'], 'nhay-vot-qua-nui': ['meadow', 'mint'] },
  'voi-sieu-thu': { 'voi-rong-nuoc': ['forest', 'dusk'], 'khong-lo': ['city', 'morning'], 'tai-bay-luon': ['cloudland', 'day'], 'bong-bong-bao-ve': ['garden', 'pink'], 'dam-chan-dong-dat': ['canyon', 'sunset'] },
  'dai-bang': { 'canh-thep': ['peak', 'day'], 'mat-than-tia-x': ['galaxy', 'space'], 'loc-xoay': ['desert', 'storm'], 'long-vu-phi-tieu': ['forest', 'morning'], 'bo-nhao-sieu-toc': ['cloudland', 'sunset'] },
  'meo-sieu-thu': { 'bong-dem': ['nightCity', 'deep'], 'leo-tuong': ['city', 'dusk'], 'nhay-sieu-cao': ['playground', 'day'], 'ria-radar': ['starField', 'night'], 'chin-mang': ['spring', 'pink'] },
  'cho-sieu-thu': { 'mui-tham-tu': ['park', 'morning'], 'cuu-ho-sieu-toc': ['river', 'day'], 'khien-xuong': ['farm', 'day'], 'chi-huy-doi': ['stationInside', 'day'], 'nhay-du-cuu-ho': ['meadow', 'day'] },

  // 02 · Vương Quốc Kẹo Ngọt
  donut: { 'nha-vua': ['palaceHall', 'pink'], 'le-dang-quang': ['palaceHall', 'dusk'], 'tiec-tra-hoang-gia': ['garden', 'day'], 'dieu-hanh-hoang-gia': ['park', 'pink'], 'nguoi-dua-thu': ['rainbowHills', 'day'] },
  cupcake: { 'cong-chua': ['spring', 'day'], 'nang-tien-duong': ['cloudland', 'pink'], 'da-hoi-khieu-vu': ['stage', 'night'], 'vuon-hoa-thuong-uyen': ['garden', 'mint'], 'tiec-sinh-nhat': ['playground', 'pink'] },
  'keo-mut': { 'hoang-tu': ['meadow', 'morning'], 'hiep-si': ['forest', 'day'], 'can-ve-cam-giao': ['city', 'pink'], 'nhac-cong-ken-dong': ['stage', 'sunset'], 'phap-su-keo-ngot': ['starField', 'dusk'] },
  'kem-oc-que': { 'nu-hoang-bang-gia': ['aurora', 'dusk'], 'thi-nu-quat-long': ['spring', 'sunset'], 'tho-lam-vuon': ['garden', 'morning'], 'dau-bep-hoang-gia': ['kitchen', 'day'], 'ngu-trua-goi-nhung': ['bedroom', 'night'] },
  'banh-quy': { 'linh-gac': ['snowVillage', 'day'], 'thu-kho-chia-khoa': ['workshop', 'morning'], 'thu-thu-hoang-gia': ['library', 'day'], 'nguoi-gac-chuong': ['meadow', 'sunset'], 'xa-thu-cung-ten': ['forest', 'sunset'] },
  'banh-kem': { 'hoang-hau': ['palaceHall', 'mint'], 'dam-cuoi-co-tich': ['spring', 'mint'], 'dem-hoi-anh-nen': ['starField', 'deep'], 'yen-tiec-hoang-cung': ['meadow', 'dusk'], 'qua-mung-sinh-nhat-vua': ['rainbowHills', 'sunset'] },

  // 03 · Đội Xe Chinh Phục Vũ Trụ
  'xe-dua': { 'phan-luc': ['marsDesert', 'space'], 'dua-vong-quanh-hanh-tinh': ['nebula', 'space'], 'dua-tren-duong-sao': ['galaxy', 'deep'], 'vuot-mua-thien-thach': ['asteroidBelt', 'space'], 've-dich-ngan-ha': ['moonSurface', 'nebula'] },
  'xe-buyt-vu-tru': { 'cho-phi-hanh-gia': ['moonSurface', 'space'], 'kinh-vom-khong-gian': ['alienJungle', 'alien'], 'nhun-nhay-hanh-tinh-la': ['marsDesert', 'nebula'], 'tram-dung-vu-tru': ['moonSurface', 'deep'], 'chay-tren-vanh-dai': ['ringPlanet', 'space'] },
  'xe-cuu-hoa': { 'dap-lua-thien-thach': ['marsDesert', 'deep'], 'thang-len-tram': ['moonSurface', 'alien'], 'cuu-ho-tau-vu-tru': ['nebula', 'nebula'], 'phun-bot': ['stationInside', 'space'], 'tuan-tra-hanh-tinh-la': ['alienJungle', 'deep'] },
  'tau-hoa-vu-tru': { 'duong-ray-ngan-ha': ['galaxy', 'dusk'], 'toc-hanh-xuyen-sao': ['nebula', 'deep'], 'cho-hang-len-tram': ['asteroidBelt', 'nebula'], 'duong-ham-vu-tru': ['galaxy', 'nebula'], 'toa-kinh-ngam-sao': ['starField', 'space'] },
  'may-bay-vu-tru': { 'canh-ten-lua': ['ringPlanet', 'nebula'], 'bay-qua-vong-hanh-tinh': ['nebula', 'alien'], 'nhao-lon-giua-sao': ['galaxy', 'alien'], 'tiep-nhien-lieu': ['asteroidBelt', 'deep'], 'ha-canh-hanh-tinh-la': ['marsDesert', 'alien'] },
  'truc-thang': { 'canh-quat-sieu-toc': ['alienJungle', 'nebula'], 'tha-du-tiep-te': ['marsDesert', 'dusk'], 'soi-den-hang': ['crystalCave', 'deep'], 'cho-ve-tinh': ['ringPlanet', 'alien'], 'cuu-ho-phi-hanh-gia': ['asteroidBelt', 'alien'] },

  // 07 · Thị Trấn Khủng Long Tài Ba
  'khung-long-bao-chua': { 'dau-bep': ['kitchen', 'pink'], 'ca-si': ['stage', 'dusk'], 'tho-xay': ['city', 'day'], 'canh-sat-giao-thong': ['city', 'sunset'], 'buu-ta': ['park', 'day'] },
  'khung-long-co-dai': { 'linh-cuu-hoa': ['city', 'storm'], 'tho-lau-kinh': ['city', 'mint'], 'nguoi-thap-den-duong': ['park', 'dusk'], 'giao-vien': ['classroom', 'day'], 'kiem-lam': ['forest', 'mint'] },
  'khung-long-ba-sung': { 'bac-si': ['park', 'mint'], 'tho-cat-toc': ['workshop', 'pink'], 'nguoi-ban-hoa': ['garden', 'sunset'], 'tho-moc': ['workshop', 'day'], 'nhac-truong': ['stage', 'pink'] },
  'khung-long-gai-lung': { 'nong-dan': ['farm', 'morning'], 'tho-lam-vuon': ['garden', 'dusk'], 'tho-gom': ['workshop', 'sunset'], 'tho-dan-len': ['snowVillage', 'morning'], 'nguoi-quet-la': ['autumn', 'sunset'] },
  'duc-long': { 'phi-cong': ['cloudland', 'morning'], 'nha-du-bao-thoi-tiet': ['rainyStreet', 'dusk'], 'nhiep-anh-gia': ['jungle', 'day'], 'nguoi-lam-dieu': ['meadow', 'pink'], 'cuu-ho-bo-bien': ['beach', 'day'] },
  'khung-long-mao-ken': { 'nha-tham-hiem': ['jungle', 'morning'], 'nhac-cong-ken': ['stage', 'morning'], 'nha-khao-co': ['desert', 'sunset'], 'huong-dan-vien': ['waterfall', 'morning'], 'tham-tu': ['library', 'dusk'] },

  // 08 · Đại Hội Thể Thao Trái Cây
  'tao-the-thao': { 'da-bong': ['stadium', 'day'], 'chay-tiep-suc': ['stadium', 'morning'], 'ban-cung': ['park', 'sunset'], 'dau-kiem': ['gym', 'day'], 'cu-ta': ['gym', 'pink'] },
  'chuoi-the-thao': { 'luot-song': ['sunsetSea', 'sunset'], 'cheo-thuyen-kayak': ['river', 'morning'], 'truot-tuyet': ['snowVillage', 'dusk'], 'nhay-sao': ['stadium', 'sunset'], 'leo-nui': ['peak', 'storm'] },
  'dau-tay-the-thao': { 'the-duc-ruy-bang': ['gym', 'mint'], 'truot-bang-nghe-thuat': ['iceRink', 'pink'], 'cau-long': ['gym', 'morning'], 'nhay-day': ['playground', 'morning'], yoga: ['beach', 'morning'] },
  'dua-hau-the-thao': { 'bong-ro': ['playground', 'mint'], 'bong-chuyen-bai-bien': ['beach', 'sunset'], bowling: ['gym', 'night'], 'boi-loi': ['sunsetSea', 'day'], 'keo-co': ['meadow', 'storm'] },
  dua: { 'quan-vot': ['stadium', 'pink'], 'bong-ban': ['gym', 'dusk'], golf: ['rainbowHills', 'morning'], karate: ['gym', 'storm'], 'bong-chay': ['stadium', 'dusk'] },
  'cam-the-thao': { 'truot-van': ['playground', 'sunset'], 'quyen-anh': ['stage', 'day'], 'khuc-con-cau': ['iceRink', 'day'], 'truot-patin': ['river', 'sunset'], 'nhay-bat-lo-xo': ['playground', 'dusk'] },
};

export function bgFor(objSlug, variantSlug) {
  return M[objSlug]?.[variantSlug] || null;
}

/** Kiểm tra: mọi tranh đều có bối cảnh và không cặp (khung cảnh, màu trời) nào trùng. */
export function checkBgMap(objects, variantsOf) {
  const seen = new Map();
  const errors = [];
  for (const o of objects) {
    for (const v of variantsOf(o)) {
      const bg = bgFor(o.slug, v.slug);
      if (!bg) {
        errors.push(`Thiếu bối cảnh: ${o.slug}--${v.slug}`);
        continue;
      }
      const key = bg.join('/');
      if (seen.has(key)) errors.push(`Trùng bối cảnh ${key}: ${seen.get(key)} và ${o.slug}--${v.slug}`);
      else seen.set(key, `${o.slug}--${v.slug}`);
    }
  }
  return errors;
}
