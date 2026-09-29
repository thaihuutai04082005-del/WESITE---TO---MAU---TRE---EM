// Bối cảnh Đợt 3: [khung cảnh, 'màu trời ưu tiên|màu 2…'] — bg-map.mjs tự chọn màu trời còn trống.
export const M3 = {
  // 10 · Phòng Thí Nghiệm Kỳ Diệu
  'ong-nghiem': { 'sui-bot-cau-vong': ['lab', 'aqua'], 'khoi-hinh-con-tho': ['lab', 'lavender'], 'ban-phao-hoa-mini': ['nightCity', 'nebula|deep'], 'moc-tinh-the-tim': ['crystalCave', 'lavender|pink'], 'lo-lung-khong-trong-luc': ['stationInside', 'space|deep'] },
  'binh-tam-giac': { 'trao-bot-xa-phong': ['lab', 'mint'], 'khoi-hinh-trai-tim': ['lab', 'pink'], 'phun-trao-nui-lua': ['volcanoValley', 'sunset|dusk'], 'ba-lop-mau': ['lab', 'lemon'], 'ket-tinh-bong-tuyet': ['snowVillage', 'aqua|lavender'] },
  'kinh-hien-vi': { 'soi-vi-khuan-vui-nhon': ['lab', 'peach'], 'soi-giot-nuoc': ['classroom', 'aqua|mint'], 'soi-la-cay': ['garden', 'lemon|lavender'], 'soi-tinh-the-muoi': ['lab', 'day'], 'anh-sang-than-ky': ['lab', 'night'] },
  'nam-cham': { 'hut-kep-giay': ['classroom', 'lemon|peach'], 'hut-dinh-vit': ['workshop', 'lemon|aqua'], 'nang-o-to-do-choi': ['playroom', 'lemon|aqua'], 'vong-tu-truong': ['lab', 'dusk'], 'day-nhau-lo-lung': ['lab', 'morning'] },
  'kinh-lup': { 'soi-chu-kien': ['meadow', 'lemon|peach'], 'soi-bo-rua': ['garden', 'peach|aqua'], 'hoi-tu-tia-nang': ['park', 'lemon|peach'], 'soi-bong-tuyet': ['snowVillage', 'lemon|peach'], 'soi-vo-oc': ['beach', 'lemon|peach'] },
  'mo-hinh-nguyen-tu': { 'quay-tit-sieu-toc': ['lab', 'storm'], 'ghep-phan-tu-nuoc': ['lab', 'sunset'], 'tia-dien-lap-lanh': ['lab', 'deep'], 'troi-giua-vu-tru': ['galaxy', 'nebula|space'], 'no-phao-hoa-hat': ['nebula', 'space|alien'] },

  // 11 · Xưởng Nghệ Thuật Sắc Màu
  'co-ve': { 've-cau-vong': ['artStudio', 'day'], 've-song-bien': ['seaHorizon', 'lemon|aqua'], 've-mat-troi': ['artStudio', 'morning'], 've-bong-hoa': ['garden', 'mint|pink'], 've-ca-vang': ['artStudio', 'aqua'] },
  'but-chi-mau': { 've-ngoi-nha': ['artStudio', 'peach'], 've-xoan-oc': ['artStudio', 'lavender'], 've-ngoi-sao': ['artStudio', 'night'], 've-dam-may': ['cloudland', 'lemon|lavender'], 've-canh-dieu': ['meadow', 'day|morning'] },
  'but-sap': { 've-cham-bi': ['classroom', 'lavender|pink'], 've-trai-tim': ['artStudio', 'pink'], 've-meo-con': ['artStudio', 'mint'], 've-ten-lua': ['classroom', 'space|deep'], 've-buom-xinh': ['garden', 'pink|day'] },
  'bang-mau': { 'pha-mau-moi': ['artStudio', 'lemon'], 'mau-tung-toe': ['artStudio', 'storm'], 've-tranh-ngoai-troi': ['park', 'aqua|lavender'], 've-chan-dung': ['gallery', 'peach'], 'trien-lam-tranh': ['gallery', 'lavender'] },
  'tuyp-mau': { 'bop-mau-thanh-song': ['artStudio', 'dusk'], 've-sau-bien': ['beach', 'aqua|lavender'], 'in-dau-ban-tay': ['classroom', 'peach|mint'], 've-thuyen-buom': ['artStudio', 'sunset'], 've-hoa-huong-duong': ['sunflowerField', 'lemon|aqua'] },
  'gia-ve': { 've-cham-mau': ['gallery', 'mint'], 've-trai-tim-hong': ['gallery', 'pink'], 've-hoang-hon': ['seaHorizon', 'peach|lavender'], 'bo-suu-tap-tranh': ['gallery', 'lemon'], 'tranh-biet-bay': ['gallery', 'aqua'] },

  // 13 · Hạm Đội Hải Tặc Kho Báu
  'tau-hai-tac': { 'vuot-bao-lon': ['sunsetSea', 'storm'], 'cap-dao-hoang': ['sunsetSea', 'day|morning'], 'gap-ca-voi': ['sunsetSea', 'mint|aqua'], 'san-kho-bau-dem-trang': ['sunsetSea', 'night|deep'], 'mung-chien-thang': ['sunsetSea', 'sunset'] },
  'ruong-kho-bau': { 'chim-duoi-day-bien': ['underwater', 'aqua|mint'], 'day-ap-vang': ['cove', 'day'], 'chon-tren-dao-hoang': ['cove', 'sunset'], 'mo-bang-chia-khoa-vang': ['cove', 'lemon'], 'trong-hang-kho-bau': ['crystalCave', 'deep|space'] },
  'la-ban': { 'chi-duong-qua-bao': ['harbor', 'storm'], 'tim-dao-hoang': ['seaHorizon', 'aqua|mint'], 'chi-huong-sao-bac-cuc': ['harbor', 'night'], 'qua-rung-ram': ['jungle', 'lemon|aqua'], 'di-theo-dau-chan': ['beach', 'aqua|peach'] },
  'mo-neo': { 'tha-neo-day-bien': ['underwater', 'day|morning'], 'san-ho-quan-quanh': ['underwater', 'pink|peach'], 'bach-tuoc-om-neo': ['underwater', 'lavender|lemon'], 'keo-neo-len-tau': ['underwater', 'deep|night'], 'nghi-tren-ben-cang': ['harbor', 'peach'] },
  'ban-do-kho-bau': { 'bay-trong-gio-bao': ['cove', 'storm'], 'chi-duong-toi-kho-bau': ['cove', 'aqua'], 'dao-nui-lua': ['seaHorizon', 'peach|lemon'], 'he-lo-duoi-anh-trang': ['cove', 'night'], 'tim-thay-dau-x': ['beach', 'lavender|mint'] },
  'banh-lai': { 'lai-qua-song-du': ['harbor', 'dusk'], 'tranh-da-ngam': ['harbor', 'mint'], 'theo-hai-au': ['harbor', 'day'], 'dem-hai-dang': ['harbor', 'deep'], 've-ben-chien-thang': ['harbor', 'sunset'] },

  // 14 · Rạp Xiếc Diệu Kỳ
  'leu-xiec': { 'den-san-khau-bat-sang': ['circusGrounds', 'night'], 'doan-xiec-toi-thi-tran': ['circusGrounds', 'day'], 'co-bay-phap-phoi': ['circusGrounds', 'aqua'], 'dem-hoi-phao-giay': ['circusGrounds', 'deep'], 'bong-bay-chao-khach': ['circusGrounds', 'peach'] },
  'mu-ao-thuat': { 'tho-trang-nhay-ra': ['stage', 'dusk|lavender'], 'bo-cau-bay-ra': ['stage', 'mint|aqua'], 'bien-ra-hoa': ['circusRing', 'pink'], 'khan-dai-bat-tan': ['circusRing', 'lemon'], 'dua-phep-lap-lanh': ['stage', 'deep|nebula'] },
  'bong-tung-hung': { 'tung-hung-nam-bong': ['circusRing', 'day'], 'nhay-qua-vong-lua': ['circusRing', 'dusk'], 'lan-tren-day': ['circusRing', 'aqua'], 'xep-thap-bong': ['circusRing', 'mint'], 'mua-phao-giay': ['circusRing', 'peach'] },
  'vong-nhao-lon': { 'xoay-tit-san-khau': ['stage', 'pink|peach'], 'mua-ruy-bang': ['circusRing', 'lavender'], 'lan-vong-qua-san': ['circusGrounds', 'lemon'], 'chong-ba-vong': ['circusRing', 'morning'], 'ha-man-tung-hoa': ['circusRing', 'storm'] },
  'trong-xiec': { 'go-nhip-mo-man': ['circusRing', 'sunset'], 'trong-dieu-hanh': ['circusGrounds', 'mint'], 'tau-nhac-cung-ken': ['stage', 'morning|day'], 'dem-nhac-anh-den': ['stage', 'night|space'], 'man-ket-phao-giay': ['circusRing', 'night'] },
  'xa-du': { 'du-cao-cham-sao': ['circusRing', 'deep'], 'bay-qua-luoi-an-toan': ['circusRing', 'nebula'], 'du-doi-ban-than': ['circusRing', 'alien'], 'du-giua-den-chieu': ['circusRing', 'space'], 'tung-phao-giay-tren-cao': ['circusGrounds', 'lavender'] },

  // 15 · Thành Phố Máy Móc Tí Hon
  'banh-rang': { 'len-day-cot': ['factory', 'morning'], 'chay-thap-dong-ho': ['tinyTown', 'day'], 'keo-bang-chuyen': ['factory', 'day'], 'nghi-trua-uong-dau': ['factory', 'peach'], 'quay-du-quay-ti-hon': ['tinyTown', 'sunset'] },
  'co-le': { 'sua-duong-ong': ['factory', 'mint'], 'xay-duong-ti-hon': ['tinyTown', 'morning'], 'sua-xe-dap': ['workshop', 'mint|peach'], 'di-lam-buoi-sang': ['tinyTown', 'lemon'], 'siet-oc-cau-sat': ['river', 'lemon|aqua'] },
  'tua-vit': { 'lap-ghe-go': ['workshop', 'lavender|pink'], 'van-oc-bien-bao': ['tinyTown', 'aqua'], 'sua-hop-thu': ['tinyTown', 'peach'], 'nghi-trua-duoi-o': ['park', 'peach|aqua'], 'lap-chong-chong': ['tinyTown', 'mint'] },
  'bong-den': { 'thap-den-thanh-pho': ['tinyTown', 'night'], 'y-tuong-chot-loe': ['factory', 'lemon'], 'den-duong-ti-hon': ['tinyTown', 'deep'], 'soi-duong-dem-mua': ['rainyStreet', 'night|deep'], 'chuoi-den-nha-ti-hon': ['tinyTown', 'dusk'] },
  'dong-ho-bao-thuc': { 'reng-reng-buoi-sang': ['bedroom', 'morning|day'], 'goi-ca-pho-day': ['tinyTown', 'pink'], 'di-lam-dung-gio': ['tinyTown', 'lavender'], 'nghi-trua-ngu-gat': ['factory', 'lavender'], 'len-day-cot-buoi-toi': ['factory', 'night'] },
  'quat-dien': { 'thoi-mat-ca-pho': ['tinyTown', 'storm'], 'thoi-buom-thuyen-giay': ['park', 'lavender|lemon'], 'thoi-chong-chong': ['factory', 'aqua'], 'thoi-bay-la-thu': ['autumn', 'lemon|peach'], 'thoi-bong-xa-phong': ['factory', 'pink'] },
};
