# SEO cho TinyTints

Tên miền chính hiện được ghi trong tài liệu triển khai là `https://tinytints.pages.dev`.
Không có cam kết thứ hạng, thời gian lập chỉ mục hay xuất hiện trong Google Discover.

## Những gì được tạo khi build

Chạy từ thư mục gốc:

```bash
npm run build
node --test frontend/test/*.test.mjs
node frontend/scripts/check-seo.mjs
```

Lệnh build tạo HTML có nội dung, tiêu đề, mô tả, canonical, Open Graph/Twitter,
hreflang và JSON-LD cho sáu trang công khai. Không cần gọi API khi tạo các trang này:

| Tiếng Anh | Tiếng Việt | Nội dung |
| --- | --- | --- |
| `/` | `/vi` | Giới thiệu tô màu trực tuyến, tính năng, câu hỏi thường gặp |
| `/coloring-pages` | `/tranh-to-mau` | Chủ đề tranh và gợi ý chọn tranh |
| `/how-to-color` | `/huong-dan-to-mau` | Hướng dẫn sử dụng cho bé và phụ huynh |

Nội dung công khai dùng chung giữa HTML tĩnh và React. Người dùng không bật
JavaScript vẫn đọc được nội dung và đi theo các liên kết. Nội dung vẫn xuất hiện
khi backend đang ngủ hoặc không truy cập được. Tài khoản, tranh cá nhân, trang
thanh toán và kết quả giao dịch dùng HTML ứng dụng riêng với `noindex` và không
nằm trong sitemap. Đây là kiểm soát lập chỉ mục, không thay thế xác thực API.

`sitemap.xml`, `robots.txt`, `_redirects` và `_headers` được sinh trong `frontend/dist`.
Cloudflare Pages cần chạy `npm run build` (hoặc workspace frontend) và xuất bản
**toàn bộ** `frontend/dist`, không chỉ `index.html` và assets. File `404.html` giúp
URL không tồn tại trả 404 thay vì bị hiểu nhầm là một bản sao trang chủ.
Express cũng hỗ trợ cùng các URL khi phục vụ bản build.

Trang HTML nội bộ của ứng dụng là file không có phần mở rộng `__app-shell`.
Không đổi đích rewrite 200 thành một file `.html`: Cloudflare Pages sẽ tự đổi
file đó sang clean URL, làm mất đường dẫn `/shop`, `/plans` hoặc kết quả thanh toán.
`Content-Type: text/html` được đặt cho entry này và các route ứng dụng.
Các địa chỉ `/app` và `/app.html` từ cấu hình cũ chuyển về trang chủ.

Khi thay đổi `_redirects` hoặc `_headers`, kiểm tra bằng runtime Pages, ngoài
Vite/Express. Dùng Wrangler đã cài, chạy từ thư mục gốc trong một terminal:

```bash
wrangler pages dev frontend/dist --ip 127.0.0.1 --port 8788
```

Sau đó chạy trong terminal khác:

```bash
node frontend/scripts/check-pages-routing.mjs
```

Các trang ứng dụng phải trả HTML trực tiếp với HTTP 200, không đổi URL sang
entry nội bộ; query của kết quả thanh toán phải được giữ. Sáu trang công khai
vẫn được lập chỉ mục, các route riêng tư vẫn `noindex` và URL không có phải trả 404.

Ảnh animation Tô cùng nhau nằm trong `/animations/together/`, tách khỏi route
phòng `/together/*`. Build chặn asset tĩnh nằm dưới các wildcard ứng dụng để
tránh trả nhầm HTML cho ảnh. URL ảnh `/together/*.webp` cũ được chuyển 301 tới
ảnh mới để các tab đang mở vẫn tải được. Kiểm tra Pages ở trên cũng xác minh
Content-Type và chữ ký WebP của toàn bộ lớp ảnh, bao gồm URL cũ.

Khi chuyển sang tên miền khác, đặt `VITE_SITE_URL=https://ten-mien-chinh` ở bước
build. Chỉ dùng một origin HTTPS chính, không thêm đường dẫn hoặc thông tin bí mật.
Build lại và kiểm tra canonical/hreflang/sitemap đều dùng miền mới. Đổi tên miền
còn cần redirect 301 từ miền cũ trong hosting; biến build không tự cấu hình DNS
hay redirect giữa hai miền.

## Việc chủ website cần làm trên Google

1. Sau khi triển khai, mở `/robots.txt`, `/sitemap.xml` và sáu trang công khai.
   Kiểm tra View Source: phải có nội dung, canonical đúng miền và `index, follow`.
   Trang `/login` và `/payment/result` phải có `noindex`; URL ngẫu nhiên phải trả 404.
2. Vào [Google Search Console](https://search.google.com/search-console/).
   Với miền `pages.dev`, thêm URL-prefix property `https://tinytints.pages.dev/`.
   Hoàn thành xác minh bằng phương thức Google cung cấp. Nếu dùng HTML file,
   đặt **file xác minh chính xác do Google cấp** vào `frontend/public` rồi triển khai.
   Không tự tạo mã xác minh. Với tên miền riêng do bạn quản lý DNS, có thể dùng
   Domain property và bản ghi DNS theo hướng dẫn của Google.
3. Trong Sitemaps, gửi `https://tinytints.pages.dev/sitemap.xml` (đổi miền nếu cần).
4. Dùng URL Inspection cho `/vi`, `/tranh-to-mau`, `/huong-dan-to-mau` và các bản
   tiếng Anh, chạy kiểm tra trực tiếp rồi yêu cầu lập chỉ mục. Google quyết định
   lịch thu thập và có lập chỉ mục hay không.
5. Theo dõi Pages, Performance và Core Web Vitals. Dùng truy vấn thực tế để cải
   thiện nội dung; không tạo hàng loạt trang chỉ thay từ khóa, đánh giá giả hoặc
   backlink mua bán. Không đưa token, dữ liệu trẻ em hay tranh riêng vào sitemap.

## Chăm sóc nội dung

Giữ các giới hạn gói trong phần FAQ khớp sản phẩm. Thêm bài hướng dẫn hoặc chủ đề
mới khi có nội dung hữu ích thực sự và tranh tương ứng; mỗi trang cần URL,
tiêu đề và mô tả riêng. Chia sẻ liên kết từ các kênh của website và cộng đồng
phù hợp theo quy định của họ. Không cần nhồi meta keywords; Google không dùng
thẻ đó để xếp hạng.

Nguồn hướng dẫn chính thức:

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Ngôn ngữ và hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Tạo và gửi sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
