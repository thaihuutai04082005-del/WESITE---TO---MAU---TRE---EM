// Bối cảnh Đợt 2: [khung cảnh, 'màu trời ưu tiên|màu 2…']. bg-map.mjs tự chọn màu trời còn trống
// (theo thứ tự ưu tiên) để cặp (khung cảnh, màu trời) không trùng tranh nào trên toàn web.
export const M2 = {
  // 04 · Khu Rừng Cây Thần
  'cay-co-thu': { 'canh-cua-bi-mat': ['forest', 'dusk|morning'], 'qua-tao-vang': ['orchard', 'day'], 'xich-du-phep-thuat': ['meadow', 'night|deep'], 're-cay-biet-di': ['jungle', 'mint|pink'], 'vuong-mien-la-than': ['rainbowHills', 'mint|dusk'] },
  'cay-thong': { 'den-long-tien': ['forest', 'night|deep'], 'ngoi-sao-uoc-nguyen': ['starField', 'lavender|peach'], 'tuyet-phep-mau': ['snowVillage', 'night|pink|mint'], 'qua-bat-ngo': ['snowVillage', 'dusk|storm'], 'chuong-gio-pha-le': ['peak', 'dusk|pink'] },
  'cay-dua': { 'vong-may': ['beach', 'morning|mint'], 'qua-dua-biet-nhay': ['beach', 'pink|dusk'], 'la-quat-bay': ['cloudland', 'mint|dusk'], 'suoi-nuoc-than': ['jungle', 'day|sunset'], 'dao-hoang-hon': ['seaHorizon', 'sunset'] },
  'cay-xuong-rong': { 'no-hoa-ngu-sac': ['desert', 'morning|pink'], 'doi-mu-phu-thuy': ['desert', 'night|dusk'], 'oc-dao-than-ky': ['desert', 'mint|sunset'], 'gai-ngoc-lap-lanh': ['crystalCave', 'dusk|night'], 'o-hoa-sa-mac': ['canyon', 'pink|mint'] },
  'cay-lieu': { 'toc-lieu-tet-hoa': ['spring', 'morning|dusk'], 'dom-dom-thap-sang': ['lake', 'night|deep'], 'soi-guong-mat-ho': ['lake', 'morning|sunset'], 'mua-cung-gio': ['meadow', 'storm|day'], 'chiec-noi-la': ['garden', 'dusk|storm'] },
  'khom-tre': { 'sao-truc-than': ['terraces', 'morning'], 'cay-cau-tre': ['river', 'dusk|pink'], 'mang-non-lon-vu': ['forest', 'mint|storm'], 'chuon-chuon-tre': ['terraces', 'day'], 'dem-trang-ram': ['terraces', 'night'] },

  // 05 · Thành Phố Nhà Biết Bay
  'nha-go-biet-bay': { 'khinh-khi-cau': ['meadow', 'dusk|pink'], 'doi-canh-chim': ['cloudland', 'dusk|storm'], 'cuoi-dam-may': ['mountainDawn', 'morning'], 'dieu-keo-nha': ['farm', 'mint|pink'], 'bay-qua-cau-vong': ['rainbowHills', 'storm|dusk'] },
  'nha-pho': { 'canh-quat-truc-thang': ['city', 'night|dusk'], 'chum-bong-bay': ['rooftops', 'day'], 'ten-lua-day': ['rooftops', 'sunset'], 'bay-giua-sao-dem': ['nightCity', 'deep|dusk'], 'ha-canh-tren-may': ['cloudland', 'sunset|pink'] },
  'chung-cu-biet-bay': { 'dong-co-phan-luc': ['city', 'deep|storm'], 'canh-may-bay': ['rooftops', 'mint'], 'cang-buom-bay': ['seaHorizon', 'day'], 'dan-chim-dan-duong': ['mountainDawn', 'pink'], 'buoc-day-vao-may': ['cloudland', 'storm|night'] },
  'nha-san': { 'den-troi-nang-nha': ['terraces', 'dusk'], 'canh-dieu-sao': ['river', 'storm|mint'], 'bay-qua-ruong-bac-thang': ['terraces', 'sunset'], 'mai-cheo-may': ['cloudland', 'deep|night'], 'hac-giay-dan-duong': ['jungle', 'dusk|storm'] },
  'nha-tuyet': { 'bay-tren-cuc-quang': ['aurora', 'deep|dusk'], 'chong-chong-tuyet': ['snowVillage', 'mint|pink'], 'khinh-khi-cau-bang': ['snowVillage', 'sunset|storm'], 'truot-may-tuyet': ['peak', 'night|pink'], 'bong-tuyet-nang-nha': ['aurora', 'morning|mint'] },
  'coi-xay-gio': { 'canh-quat-cat-canh': ['farm', 'pink|dusk'], 'bay-theo-gio-mua': ['lavenderField', 'storm'], 'keo-canh-dong-hoa': ['lavenderField', 'day'], 'luon-vong-hoang-hon': ['lavenderField', 'sunset'], 'ha-canh-doi-co': ['sunflowerField', 'day'] },

  // 06 · Xứ Sở Đồ Chơi Thức Giấc (đêm trong phòng)
  'bup-be-go': { 'thuc-day-vuon-vai': ['playroom', 'night'], 'mua-ba-le': ['stage', 'deep|nebula'], 'tiec-tra-nua-dem': ['playroom', 'dusk'], 'ngam-trang-ben-cua-so': ['moonWindow', 'night'], 'ru-em-ngu': ['bedroom', 'dusk|deep'] },
  'linh-chi': { 'dieu-hanh-nua-dem': ['toyShelf', 'night'], 'thoi-ken-bao-thuc': ['moonWindow', 'dusk'], 'canh-gac-hop-do-choi': ['attic', 'night'], 'cheo-thuyen-giay': ['playroom', 'deep'], 'chao-binh-minh': ['moonWindow', 'morning'] },
  'ngua-bap-benh': { 'phi-nuoc-dai': ['playroom', 'mint'], 'nhay-qua-goi': ['bedroom', 'pink|mint'], 'keo-xe-do-choi': ['toyShelf', 'dusk'], 'doi-vong-hoa': ['attic', 'pink'], 'ngu-gat-luc-binh-minh': ['moonWindow', 'sunset'] },
  'con-quay': { 'xoay-tit': ['playroom', 'pink'], 'khieu-vu-vong-tron': ['stage', 'mint|alien'], 've-vong-sao': ['toyShelf', 'deep'], 'truot-tren-san-go': ['attic', 'dusk'], 'dua-voi-bi-ve': ['playroom', 'sunset'] },
  'hop-hinh-nhay': { 'bat-ra-chao': ['toyShelf', 'pink'], 'ao-thuat-hoa-giay': ['stage', 'storm|space'], 'hop-nhac-ngan-nga': ['attic', 'deep'], 'tron-tim': ['bedroom', 'mint|storm'], 'tang-qua': ['toyShelf', 'mint'] },
  'khoi-xep-chu': { 'xep-thap-cao': ['playroom', 'morning'], 'chuc-ngu-ngon': ['bedroom', 'deep|nebula'], 'xep-doan-tau': ['toyShelf', 'morning'], 'do-domino': ['attic', 'morning'], 'cau-thang-len-ke': ['toyShelf', 'sunset'] },

  // 09 · Vương Quốc Thiên Thể (trời không có mặt trời/trăng trang trí)
  'mat-troi': { 'thuc-day-vuon-vai': ['mountainDawn', 'sunset'], 'tap-the-duc': ['park', 'storm|day'], 'di-bien': ['beach', 'mint|sunset'], 'dap-xe-buoi-sang': ['park', 'night|storm'], 'chao-buoi-chieu': ['seaHorizon', 'pink'] },
  'mat-trang': { 'danh-rang': ['bedroom', 'night|nebula'], 'doc-sach': ['library', 'night|deep'], 'ke-chuyen-ru-ngu': ['starField', 'nebula|alien'], 'doi-mu-ngu': ['cloudland', 'nebula|alien'], 'soi-bong-mat-ho': ['lake', 'deep|dusk'] },
  'ngoi-sao': { 'nhay-day': ['cloudland', 'space|alien'], 'hoc-bai': ['classroom', 'dusk|night'], 'hat-ru': ['stage', 'space'], 'tiec-sinh-nhat': ['playroom', 'storm'], 'roi-xuong-uoc-nguyen': ['meadow', 'nebula|space'] },
  'sao-tho': { 'lac-vong': ['starField', 'lemon|aqua'], 'tam-bon-bong-bong': ['bedroom', 'space|alien'], 'nghe-nhac': ['galaxy', 'alien|nebula'], 'truot-patin': ['asteroidBelt', 'alien|deep'], 'di-ngu-trong-chan': ['nebula', 'deep|space'] },
  'trai-dat': { 'tuoi-hoa': ['garden', 'sunset|storm'], 'om-cay-xanh': ['forest', 'storm|pink'], 'uong-nuoc-mat': ['beach', 'storm|dusk'], 'ngu-trua-duoi-o': ['park', 'alien|nebula|space'], 'di-dao-cong-vien': ['orchard', 'morning'] },
  'sao-choi': { 'chay-bo-buoi-sang': ['cloudland', 'morning|alien'], 'dua-thu': ['rooftops', 'dusk'], 'tha-dieu': ['meadow', 'alien|deep'], 'di-hoc': ['classroom', 'morning|mint'], 've-nha-buoi-toi': ['rooftops', 'night'] },

  // 12 · Vương Quốc Lâu Đài Huyền Bí
  'lau-dai-huyen-bi': { 'mua-xuan-hoa-no': ['spring', 'pink|mint'], 'mua-dong-tuyet-phu': ['snowVillage', 'storm|deep'], 'dem-phao-hoa': ['nightCity', 'nebula|night'], 'le-hoi-den-long': ['river', 'night|deep'], 'tren-doi-may': ['cloudland', 'pink|alien'] },
  'cung-dien': { 'tet-nguyen-dan': ['garden', 'pink'], 'mua-he-dai-phun-nuoc': ['desert', 'storm|day'], 'dem-trang-ram': ['desert', 'deep|space'], 'mua-thu-la-vang': ['autumn', 'morning|day'], 'le-hoi-bong-bay': ['meadow', 'space|morning'] },
  'thap-co': { 'mua-thu-la-roi': ['autumn', 'dusk|storm'], 'dem-sao-bang': ['peak', 'deep|space'], 'mua-xuan-day-leo': ['spring', 'sunset|storm'], 'le-hoi-tha-dieu': ['orchard', 'pink'], 'cau-vong-sau-mua': ['meadow', 'alien|space'] },
  'cong-thanh': { 'le-hoi-co-hoa': ['city', 'space|alien'], 'mua-dong-nguoi-tuyet': ['snowVillage', 'space|alien'], 'mua-he-huong-duong': ['sunflowerField', 'morning'], 'dem-hoi-anh-nen': ['forest', 'space|alien'], 'mua-thu-bi-ngo': ['pumpkinPatch', 'sunset'] },
  'cau-da': { 'mua-xuan-hoa-dao': ['river', 'space|alien|nebula'], 'mua-he-thuyen-giay': ['river', 'deep|nebula'], 'mua-dong-bang-gia': ['iceRink', 'dusk|storm'], 'le-hoi-hoa-dang': ['lake', 'nebula|night'], 'mua-thu-suong-som': ['autumn', 'pink|mint'] },
  'gieng-uoc': { 'mua-xuan-buom-bay': ['garden', 'space|alien|nebula'], 'mua-he-dom-dom': ['orchard', 'night'], 'mua-thu-hat-de': ['pumpkinPatch', 'morning'], 'mua-dong-tuyet-roi': ['snowVillage', 'nebula'], 'le-hoi-uoc-nguyen': ['orchard', 'dusk'] },
};
