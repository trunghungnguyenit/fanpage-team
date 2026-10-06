-- Dữ liệu mẫu theo thiết kế HTCode v4 (nội dung vi/en lấy từ từ điển cũ của frontend).
-- Các giá trị dạng [Placeholder] là nội dung giữ chỗ, cần thay bằng nội dung thật.
--
-- Chạy được nhiều lần: các bảng có khóa chữ dùng upsert; faqs và projects được xóa rồi nạp lại
-- (không bảng nào tham chiếu tới hai bảng này). CẢNH BÁO: chạy lại sẽ ghi đè nội dung đã sửa trong
-- các bảng này. Không đụng tới briefs và brief_services.

insert into public.site_texts (key, value) values
  ('address', '{"vi":"Địa chỉ văn phòng","en":"Office address"}'::jsonb),
  ('all', '{"vi":"Tất cả","en":"All"}'::jsonb),
  ('allCtaH', '{"vi":"Chưa thấy dự án giống bạn? Kể cho chúng tôi nghe.","en":"Don’t see your kind of project? Tell us about it."}'::jsonb),
  ('allH', '{"vi":"Tất cả dự án chúng tôi đã xây.","en":"Everything we’ve built."}'::jsonb),
  ('allP', '{"vi":"Lọc theo loại sản phẩm hoặc dịch vụ để tìm dự án gần với bài toán của bạn.","en":"Filter by product type or service to find work close to your problem."}'::jsonb),
  ('allSvc', '{"vi":"Tất cả dịch vụ","en":"All services"}'::jsonb),
  ('allTitle', '{"vi":"Tất cả dự án","en":"All projects"}'::jsonb),
  ('back', '{"vi":"Quay lại","en":"Back"}'::jsonb),
  ('backHome', '{"vi":"Trang chủ","en":"Home"}'::jsonb),
  ('bestMvp', '{"vi":"Phù hợp nhất cho MVP","en":"Best for MVPs"}'::jsonb),
  ('briefShort', '{"vi":"Ý tưởng của bạn, chúng tôi lắng nghe","en":"Send brief"}'::jsonb),
  ('budget', '{"vi":"Ngân sách","en":"Budget"}'::jsonb),
  ('clearFilters', '{"vi":"Xoá bộ lọc","en":"Clear filters"}'::jsonb),
  ('closeH', '{"vi":"Có ý tưởng? Kể cho chúng tôi nghe.","en":"Have an idea? Tell us about it."}'::jsonb),
  ('closeP', '{"vi":"Ý tưởng của bạn, chúng tôi lắng nghe trong 2 phút. Bạn nhận lại góc nhìn thẳng thắn của kỹ sư, phạm vi đề xuất và ước tính chi phí — kể cả khi không làm cùng chúng tôi.","en":"Send a brief in 2 minutes. You get an engineer’s honest take, a proposed scope and a cost estimate — even if you don’t work with us."}'::jsonb),
  ('ctaPrimary', '{"vi":"Ý tưởng của bạn, chúng tôi lắng nghe","en":"Send a project brief"}'::jsonb),
  ('ctaSecondary', '{"vi":"Xem dự án","en":"See our work"}'::jsonb),
  ('deliverables', '{"vi":"Bạn nhận được","en":"You receive"}'::jsonb),
  ('discoveryFree', '{"vi":"Giai đoạn Khám phá miễn phí — bạn quyết định khi đã có báo giá thật.","en":"Discovery is free — you decide once you have a real quote."}'::jsonb),
  ('doneB', '{"vi":"Một kỹ sư sẽ phản hồi qua {email} trong vòng 24 giờ làm việc để hẹn buổi trao đổi.","en":"An engineer will reply to {email} within 24 business hours to set up a call."}'::jsonb),
  ('doneT', '{"vi":"Cảm ơn {name}, đã nhận brief.","en":"Thanks {name}, brief received."}'::jsonb),
  ('email', '{"vi":"Email công việc","en":"Work email"}'::jsonb),
  ('errEmail', '{"vi":"Email chưa hợp lệ.","en":"That email doesn’t look right."}'::jsonb),
  ('errName', '{"vi":"Vui lòng nhập họ tên.","en":"Please enter your name."}'::jsonb),
  ('errSvc', '{"vi":"Vui lòng chọn ít nhất một dịch vụ.","en":"Please pick at least one service."}'::jsonb),
  ('faq', '{"vi":"FAQ","en":"FAQ"}'::jsonb),
  ('faqH', '{"vi":"Những câu hỏi chúng tôi thường nhận.","en":"Questions we always get."}'::jsonb),
  ('featuredTag', '{"vi":"Nổi bật","en":"Featured"}'::jsonb),
  ('h1a', '{"vi":"Từ ý tưởng đến","en":"From idea to a"}'::jsonb),
  ('h1b', '{"vi":"MVP chạy thật","en":"working MVP"}'::jsonb),
  ('h1c', '{"vi":"— nhanh và vững.","en":"— fast and solid."}'::jsonb),
  ('home', '{"vi":"Về trang chủ","en":"Back to home"}'::jsonb),
  ('kicker', '{"vi":"MVP & product studio","en":"MVP & product studio"}'::jsonb),
  ('lede', '{"vi":"HTCode giúp startup và doanh nghiệp ra mắt sản phẩm số đầu tiên nhanh, đúng phạm vi, với nền móng đủ chắc để mở rộng sau này.","en":"HTCode helps startups and businesses launch their first digital product quickly, with the right scope and a foundation strong enough to scale."}'::jsonb),
  ('legal', '{"vi":"Tên pháp lý · MST","en":"Legal name · Tax ID"}'::jsonb),
  ('modelLabel', '{"vi":"Hình thức hợp tác","en":"Engagement model"}'::jsonb),
  ('models', '{"vi":"Hợp tác","en":"Engagement"}'::jsonb),
  ('modelsH', '{"vi":"Bắt đầu từ tình huống của bạn.","en":"Start from your situation."}'::jsonb),
  ('modelsP', '{"vi":"Chọn câu nghe giống bạn nhất. Giai đoạn Khám phá miễn phí đi kèm cả ba.","en":"Pick the one that sounds most like you. Free Discovery comes with all three."}'::jsonb),
  ('more', '{"vi":"Xem thêm (còn {n} dự án)","en":"Load more ({n} left)"}'::jsonb),
  ('msg', '{"vi":"Mô tả ngắn","en":"Short description"}'::jsonb),
  ('msgPh', '{"vi":"Sản phẩm, người dùng, vấn đề cần giải quyết…","en":"Product, users, the problem to solve…"}'::jsonb),
  ('name', '{"vi":"Họ tên","en":"Full name"}'::jsonb),
  ('namePh', '{"vi":"Nguyễn Văn A","en":"Jane Nguyen"}'::jsonb),
  ('ndaShort', '{"vi":"NDA trước khi trao đổi","en":"NDA before details"}'::jsonb),
  ('next', '{"vi":"Tiếp tục","en":"Continue"}'::jsonb),
  ('noResults', '{"vi":"Không có dự án phù hợp.","en":"No matching projects."}'::jsonb),
  ('notSure', '{"vi":"Chưa chắc","en":"Not sure yet"}'::jsonb),
  ('orReach', '{"vi":"Hoặc liên hệ trực tiếp","en":"Or reach us directly"}'::jsonb),
  ('phoneZalo', '{"vi":"Điện thoại / Zalo","en":"Phone / Zalo / WhatsApp"}'::jsonb),
  ('privacy', '{"vi":"Thông tin của bạn chỉ dùng để phản hồi brief này. Có thể ký NDA trước khi trao đổi chi tiết.","en":"Your details are only used to reply to this brief. We can sign an NDA before any detailed discussion."}'::jsonb),
  ('process', '{"vi":"Quy trình","en":"Process"}'::jsonb),
  ('processH', '{"vi":"Quy trình được thiết kế để giảm rủi ro cho bạn.","en":"A process designed to take risk off your plate."}'::jsonb),
  ('processP', '{"vi":"Năm giai đoạn, bàn giao rõ ràng, vai trò cụ thể cho bạn. Chạm vào từng bước để xem chi tiết.","en":"Five phases, clear deliverables, a defined role for you. Tap each step for details."}'::jsonb),
  ('q1', '{"vi":"Bạn cần xây dựng gì?","en":"What do you need built?"}'::jsonb),
  ('q1sub', '{"vi":"Chọn một hoặc nhiều.","en":"Pick one or more."}'::jsonb),
  ('q2', '{"vi":"Hình thức, ngân sách & thời gian","en":"Model, budget & timing"}'::jsonb),
  ('q3', '{"vi":"Thông tin liên hệ","en":"Your details"}'::jsonb),
  ('reassure', '{"vi":["Không chào hàng ở cuộc gọi đầu","Phản hồi trong 24 giờ làm việc","Ký NDA trước khi bạn chia sẻ"],"en":["No sales pitch on the first call","Reply within 24 business hours","NDA before you share details"]}'::jsonb),
  ('reassureClose', '{"vi":["Phản hồi trong 24 giờ làm việc","NDA trước khi trao đổi chi tiết"],"en":["Reply within 24 business hours","NDA before detailed discussion"]}'::jsonb),
  ('reply24', '{"vi":"Phản hồi trong 24 giờ làm việc","en":"Reply within 24 business hours"}'::jsonb),
  ('results', '{"vi":"{n} dự án","en":"{n} projects"}'::jsonb),
  ('resultsOne', '{"vi":"{n} dự án","en":"{n} project"}'::jsonb),
  ('retainerP', '{"vi":"Bắt đầu với buổi Khám phá miễn phí — chúng tôi sẽ đề xuất hình thức phù hợp.","en":"Start with a free Discovery session — we’ll recommend the right model."}'::jsonb),
  ('retainerT', '{"vi":"Chưa chắc chọn gì?","en":"Not sure which fits?"}'::jsonb),
  ('searchPh', '{"vi":"Tìm theo tên dự án, dịch vụ…","en":"Search by name or service…"}'::jsonb),
  ('sendBrief', '{"vi":"Ý tưởng của bạn, chúng tôi lắng nghe","en":"Send a project brief"}'::jsonb),
  ('sent', '{"vi":"Đã gửi","en":"Sent"}'::jsonb),
  ('service', '{"vi":"Dịch vụ","en":"Service"}'::jsonb),
  ('serviceL', '{"vi":"Dịch vụ","en":"Service"}'::jsonb),
  ('services', '{"vi":"Dịch vụ","en":"Services"}'::jsonb),
  ('servicesH', '{"vi":"Một đội, trọn vòng đời sản phẩm.","en":"One team, the whole product lifecycle."}'::jsonb),
  ('servicesP', '{"vi":"Bắt đầu với MVP, rồi mở rộng cùng một đội ngũ đã hiểu sản phẩm của bạn.","en":"Start with an MVP, then grow with a team that already knows your product."}'::jsonb),
  ('showing', '{"vi":"Đang hiển thị {a} / {b} dự án","en":"Showing {a} of {b} projects"}'::jsonb),
  ('similar', '{"vi":"Tôi cần dự án tương tự","en":"I need something similar"}'::jsonb),
  ('sortFeat', '{"vi":"Nổi bật","en":"Featured"}'::jsonb),
  ('sortL', '{"vi":"Sắp xếp","en":"Sort"}'::jsonb),
  ('sortNew', '{"vi":"Mới nhất","en":"Newest"}'::jsonb),
  ('soundsLikeUs', '{"vi":"Nghe giống chúng tôi","en":"That’s us"}'::jsonb),
  ('start', '{"vi":"Bắt đầu","en":"Start"}'::jsonb),
  ('startProject', '{"vi":"Bắt đầu dự án","en":"Start a project"}'::jsonb),
  ('stats', '{"vi":["[Placeholder] sản phẩm đã ra mắt","[Placeholder] tuần trung bình cho MVP","[Placeholder] năm kinh nghiệm"],"en":["[Placeholder] products launched","[Placeholder] weeks avg. to MVP","[Placeholder] years of experience"]}'::jsonb),
  ('step', '{"vi":"Brief dự án · Bước","en":"Project brief · Step"}'::jsonb),
  ('submit', '{"vi":"Ý tưởng của bạn, chúng tôi lắng nghe","en":"Send brief"}'::jsonb),
  ('sumModel', '{"vi":"Hình thức","en":"Model"}'::jsonb),
  ('sumSvc', '{"vi":"Dịch vụ","en":"Services"}'::jsonb),
  ('techL', '{"vi":"Công nghệ","en":"Tech stack"}'::jsonb),
  ('trust', '{"vi":["NDA mặc định","Bạn sở hữu 100% mã nguồn","Review bảo mật mỗi bản phát hành","Hỗ trợ theo SLA","Làm việc bằng tiếng Việt & tiếng Anh"],"en":["NDA by default","You own 100% of the code","Security review every release","SLA-backed support","Vietnamese & English team"]}'::jsonb),
  ('ui', '{"vi":{"theme":"Đổi giao diện sáng/tối","language":"Ngôn ngữ","menu":"Menu","close":"Đóng","caseStudy":"Case study","notFoundTitle":"Không tìm thấy trang này.","notFoundBack":"Về trang chủ","metaTitle":"HTCode — MVP & product studio","skip":"Bỏ qua điều hướng","submitting":"Đang gửi…","submitError":"Không gửi được brief. Vui lòng thử lại."},"en":{"theme":"Toggle light/dark theme","language":"Language","menu":"Menu","close":"Close","caseStudy":"Case study","notFoundTitle":"We couldn’t find that page.","notFoundBack":"Back to home","metaTitle":"HTCode — MVP & product studio","skip":"Skip navigation","submitting":"Sending…","submitError":"We couldn’t send your brief. Please try again."}}'::jsonb),
  ('viewAll', '{"vi":"Xem tất cả dự án","en":"View all projects"}'::jsonb),
  ('why', '{"vi":[{"k":"Vấn đề của bạn","title":"Ý tưởng rõ, nhưng thời gian và ngân sách có hạn.","items":["Cần ra thị trường trước đối thủ","Chưa có đội kỹ thuật nội bộ","Sợ làm sai phạm vi, tốn tiền"]},{"k":"Cách chúng tôi làm","title":"Cắt gọn phạm vi, xây nhanh, đo lường thật.","items":["Chọn đúng tính năng cốt lõi","Sprint ngắn, demo mỗi tuần","Kiến trúc đủ chắc để mở rộng"]},{"k":"Kết quả bạn nhận","title":"Sản phẩm thật trong tay người dùng thật.","items":["Ra mắt đúng hạn, đúng ngân sách","Dữ liệu để quyết định bước tiếp theo","Nền móng sẵn sàng cho phiên bản 2"]}],"en":[{"k":"Your problem","title":"A clear idea, but limited time and budget.","items":["Need to reach market before competitors","No in-house engineering team","Worried about building the wrong scope"]},{"k":"How we work","title":"Tight scope, fast builds, real measurement.","items":["Pick the right core features","Short sprints, weekly demos","Architecture ready to scale"]},{"k":"What you get","title":"A real product in the hands of real users.","items":["Launch on time and on budget","Data to decide the next step","A foundation ready for version 2"]}]}'::jsonb),
  ('whyH', '{"vi":"Chúng tôi xây theo vấn đề kinh doanh, không theo danh sách tính năng.","en":"We build around business problems, not feature lists."}'::jsonb),
  ('whyK', '{"vi":"Vì sao chọn chúng tôi","en":"Why us"}'::jsonb),
  ('whyP', '{"vi":"MVP tốt nhất là bản nhỏ nhất chứng minh được điều quan trọng. Mọi quyết định kỹ thuật đều quay về câu hỏi đó.","en":"The best MVP is the smallest thing that proves what matters. Every technical decision comes back to that."}'::jsonb),
  ('work', '{"vi":"Dự án","en":"Work"}'::jsonb),
  ('workH', '{"vi":"Bằng chứng, không phải lời hứa.","en":"Proof, not promises."}'::jsonb),
  ('workP', '{"vi":"Các sản phẩm đang chạy thật. Bấm vào để xem trực tiếp.","en":"Live products. Open any of them to see it in action."}'::jsonb),
  ('you', '{"vi":"bạn","en":"there"}'::jsonb),
  ('yourRole', '{"vi":"Vai trò của bạn","en":"Your role"}'::jsonb),
  ('visitSite', '{"vi": "Xem website", "en": "Visit website"}'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.services (key, sort_order, icon, title, description) values
  ('mvp', 1, 'rocket', '{"vi":"MVP cho startup","en":"MVP for Startups"}'::jsonb, '{"vi":"Từ ý tưởng đến sản phẩm chạy thật, sẵn sàng thử thị trường và gọi vốn.","en":"From idea to a working product, ready to test with the market and pitch to investors."}'::jsonb),
  ('web-app', 2, 'monitor', '{"vi":"Web App","en":"Web Apps"}'::jsonb, '{"vi":"Nền tảng SaaS, dashboard, hệ thống nội bộ thay thế quy trình thủ công.","en":"SaaS platforms, dashboards and internal tools that replace manual work."}'::jsonb),
  ('mobile-app', 3, 'phone', '{"vi":"Mobile App","en":"Mobile Apps"}'::jsonb, '{"vi":"Ứng dụng iOS & Android, một codebase, hiệu năng tốt.","en":"iOS & Android from one codebase, built for performance."}'::jsonb),
  ('ai-llm', 4, 'sparkles', '{"vi":"AI / LLM","en":"AI / LLM Integration"}'::jsonb, '{"vi":"Tích hợp mô hình ngôn ngữ, chatbot, tự động hoá xử lý tài liệu.","en":"Language-model features, chatbots and document automation."}'::jsonb),
  ('ui-ux', 5, 'pen', '{"vi":"UI/UX Design","en":"UI/UX Design"}'::jsonb, '{"vi":"Nghiên cứu người dùng, wireframe, prototype và design system.","en":"User research, wireframes, prototypes and design systems."}'::jsonb),
  ('cloud-devops', 6, 'cloud', '{"vi":"Cloud & DevOps","en":"Cloud & DevOps"}'::jsonb, '{"vi":"Hạ tầng cloud, CI/CD, giám sát và tối ưu chi phí.","en":"Cloud infrastructure, CI/CD, monitoring and cost tuning."}'::jsonb),
  ('maintenance', 7, 'wrench', '{"vi":"Bảo trì & hỗ trợ","en":"Maintenance & Support"}'::jsonb, '{"vi":"Giám sát, sửa lỗi và cải tiến liên tục sau khi ra mắt.","en":"Monitoring, fixes and continuous improvement after launch."}'::jsonb)
on conflict (key) do update set sort_order = excluded.sort_order, icon = excluded.icon, title = excluded.title, description = excluded.description;

insert into public.engagement_models (key, sort_order, is_featured, default_service_key, situation, title, description, points) values
  ('fixed-price', 1, true, 'mvp', '{"vi":"Tôi cần một MVP hoặc sản phẩm có phạm vi rõ ràng.","en":"I need an MVP or a clearly scoped product."}'::jsonb, '{"vi":"Dự án trọn gói","en":"Fixed-price project"}'::jsonb, '{"vi":"Một báo giá cố định, bàn giao rõ ràng, chúng tôi chịu trách nhiệm toàn bộ.","en":"One fixed quote, clear deliverables, we own the delivery end to end."}'::jsonb, '{"vi":["Chi phí & thời gian biết trước","Phạm vi chốt sau Khám phá","Cách tốt nhất để bắt đầu hợp tác"],"en":["Cost & timeline known upfront","Scope locked after Discovery","The best way to start working together"]}'::jsonb),
  ('dedicated-team', 2, false, null, '{"vi":"Tôi cần một đội sản phẩm lâu dài.","en":"I need a long-term product team."}'::jsonb, '{"vi":"Đội ngũ chuyên trách","en":"Dedicated team"}'::jsonb, '{"vi":"Một đội kỹ sư làm việc như người của bạn, theo tháng, theo roadmap của bạn.","en":"A team of engineers working as your own, monthly, on your roadmap."}'::jsonb, '{"vi":["Cùng người, kiến thức tích luỹ","Mở rộng hoặc thu hẹp linh hoạt","Báo cáo minh bạch mỗi sprint"],"en":["Same people, accumulated knowledge","Scale up or down flexibly","Transparent reporting every sprint"]}'::jsonb),
  ('maintenance-support', 3, false, 'maintenance', '{"vi":"Sản phẩm đã chạy, tôi cần người chăm sóc.","en":"My product is live, I need someone to look after it."}'::jsonb, '{"vi":"Bảo trì & hỗ trợ","en":"Maintenance & support"}'::jsonb, '{"vi":"Gói theo tháng để giám sát, sửa lỗi, cập nhật bảo mật và cải tiến nhỏ.","en":"A monthly plan for monitoring, fixes, security updates and small improvements."}'::jsonb, '{"vi":["Phản hồi sự cố theo SLA","Cập nhật bảo mật định kỳ","Giờ phát triển cải tiến hàng tháng"],"en":["SLA-backed incident response","Regular security updates","Monthly improvement hours"]}'::jsonb)
on conflict (key) do update set sort_order = excluded.sort_order, is_featured = excluded.is_featured, default_service_key = excluded.default_service_key, situation = excluded.situation, title = excluded.title, description = excluded.description, points = excluded.points;

insert into public.budget_ranges (key, sort_order, label) values
  ('small', 1, '{"vi":"< 200 triệu","en":"< $10k"}'::jsonb),
  ('medium', 2, '{"vi":"200–500 triệu","en":"$10k–25k"}'::jsonb),
  ('large', 3, '{"vi":"> 500 triệu","en":"> $25k"}'::jsonb),
  ('unsure', 4, '{"vi":"Chưa rõ","en":"Not sure yet"}'::jsonb)
on conflict (key) do update set sort_order = excluded.sort_order, label = excluded.label;

insert into public.timelines (key, sort_order, label) values
  ('asap', 1, '{"vi":"Ngay","en":"Right away"}'::jsonb),
  ('within-1-month', 2, '{"vi":"Trong 1 tháng","en":"Within 1 month"}'::jsonb),
  ('1-3-months', 3, '{"vi":"1–3 tháng","en":"1–3 months"}'::jsonb),
  ('exploring', 4, '{"vi":"Đang tìm hiểu","en":"Just exploring"}'::jsonb)
on conflict (key) do update set sort_order = excluded.sort_order, label = excluded.label;

insert into public.process_steps (key, sort_order, title, duration, description, client_role, deliverables) values
  ('discover', 1, '{"vi":"Khám phá","en":"Discover"}'::jsonb, '{"vi":"[1–2 tuần]","en":"[1–2 weeks]"}'::jsonb, '{"vi":"Cùng xác định vấn đề, người dùng, chỉ số thành công và phạm vi MVP nhỏ nhất có giá trị.","en":"Define the problem, users, success metrics and the smallest valuable MVP scope together."}'::jsonb, '{"vi":"2–3 buổi workshop cùng đội.","en":"2–3 workshops with the team."}'::jsonb, '{"vi":["Bản đồ vấn đề & cơ hội","Phạm vi MVP đã thống nhất","Báo giá cố định & timeline"],"en":["Problem & opportunity map","Agreed MVP scope","Fixed quote & timeline"]}'::jsonb),
  ('design', 2, '{"vi":"Thiết kế","en":"Design"}'::jsonb, '{"vi":"[Thời lượng]","en":"[Duration]"}'::jsonb, '{"vi":"Wireframe, prototype bấm được và kiểm thử nhanh với người dùng trước khi viết code.","en":"Wireframes, clickable prototype and quick user tests before writing code."}'::jsonb, '{"vi":"Góp ý prototype, duyệt luồng chính.","en":"Review the prototype, approve key flows."}'::jsonb, '{"vi":["Prototype tương tác","UI kit / design system","Kết quả kiểm thử người dùng"],"en":["Interactive prototype","UI kit / design system","User test findings"]}'::jsonb),
  ('build', 3, '{"vi":"Xây dựng","en":"Build"}'::jsonb, '{"vi":"[Thời lượng]","en":"[Duration]"}'::jsonb, '{"vi":"Phát triển theo sprint ngắn, demo bản chạy được mỗi tuần, báo cáo tiến độ và rủi ro thẳng thắn.","en":"Short sprints, a working demo every week, honest progress and risk reports."}'::jsonb, '{"vi":"Dự demo hàng tuần, ưu tiên backlog.","en":"Join weekly demos, prioritise the backlog."}'::jsonb, '{"vi":["Bản build mỗi sprint","Báo cáo tiến độ hàng tuần","Mã nguồn trên repo của bạn"],"en":["A build every sprint","Weekly progress report","Code in your repository"]}'::jsonb),
  ('launch', 4, '{"vi":"Ra mắt","en":"Launch"}'::jsonb, '{"vi":"[Thời lượng]","en":"[Duration]"}'::jsonb, '{"vi":"Kiểm thử, triển khai production, thiết lập giám sát và bàn giao đầy đủ.","en":"Testing, production deployment, monitoring setup and full handover."}'::jsonb, '{"vi":"Nghiệm thu, chuẩn bị truyền thông ra mắt.","en":"Sign off, prepare launch comms."}'::jsonb, '{"vi":["Sản phẩm trên production","Tài liệu kỹ thuật & vận hành","Dashboard giám sát"],"en":["Product in production","Technical & ops documentation","Monitoring dashboard"]}'::jsonb),
  ('run-and-grow', 5, '{"vi":"Vận hành & tăng trưởng","en":"Run & grow"}'::jsonb, '{"vi":"Liên tục","en":"Ongoing"}'::jsonb, '{"vi":"Đo lường hành vi người dùng thật, sửa lỗi, tối ưu và phát triển phiên bản tiếp theo.","en":"Measure real user behaviour, fix, optimise and build the next version."}'::jsonb, '{"vi":"Chia sẻ mục tiêu kinh doanh mới.","en":"Share new business goals."}'::jsonb, '{"vi":["Báo cáo sử dụng hàng tháng","Sửa lỗi theo SLA","Lộ trình phiên bản tiếp theo"],"en":["Monthly usage report","SLA-backed fixes","Next-version roadmap"]}'::jsonb)
on conflict (key) do update set sort_order = excluded.sort_order, title = excluded.title, duration = excluded.duration, description = excluded.description, client_role = excluded.client_role, deliverables = excluded.deliverables;

truncate table public.faqs, public.projects restart identity;

insert into public.faqs (sort_order, question, answer) values
  (1, '{"vi":"Chi phí một MVP khoảng bao nhiêu?","en":"How much does an MVP cost?"}'::jsonb, '{"vi":"Tuỳ phạm vi. Sau giai đoạn Khám phá miễn phí, bạn nhận báo giá cố định kèm timeline. Không chi phí ẩn — mọi thay đổi phạm vi đều được báo giá trước khi làm.","en":"It depends on scope. After the free Discovery phase you get a fixed quote with a timeline. No hidden costs — any scope change is quoted before we do it."}'::jsonb),
  (2, '{"vi":"Mất bao lâu để ra mắt MVP?","en":"How long until the MVP launches?"}'::jsonb, '{"vi":"Phụ thuộc phạm vi — thường [X–Y tuần]. Chúng tôi giúp cắt gọn tính năng để ra mắt sớm nhất mà vẫn chứng minh được giá trị cốt lõi.","en":"Depends on scope — typically [X–Y weeks]. We help trim features so you launch as early as possible while still proving the core value."}'::jsonb),
  (3, '{"vi":"Mã nguồn và dữ liệu thuộc về ai?","en":"Who owns the code and data?"}'::jsonb, '{"vi":"Thuộc về bạn, 100%, từ ngày đầu. Mã nguồn nằm trên repo của bạn, NDA được ký trước khi trao đổi thông tin nhạy cảm.","en":"You do, 100%, from day one. Code lives in your repository, and we sign an NDA before you share anything sensitive."}'::jsonb),
  (4, '{"vi":"Tôi mới chỉ có ý tưởng — bắt đầu được không?","en":"I only have an idea — can we start?"}'::jsonb, '{"vi":"Được. Giai đoạn Khám phá chính là để biến ý tưởng thành phạm vi rõ ràng, có người dùng mục tiêu và chỉ số thành công.","en":"Yes. Discovery exists to turn an idea into a clear scope with target users and success metrics."}'::jsonb),
  (5, '{"vi":"Sau khi ra mắt thì sao?","en":"What happens after launch?"}'::jsonb, '{"vi":"Bạn có thể chuyển sang gói Bảo trì & hỗ trợ hoặc Đội ngũ chuyên trách để tiếp tục phát triển phiên bản tiếp theo.","en":"Move to a Maintenance & support plan or a Dedicated team to keep building the next version."}'::jsonb),
  (6, '{"vi":"Làm việc với khách hàng nước ngoài thế nào?","en":"How do you work with overseas clients?"}'::jsonb, '{"vi":"Đội làm việc bằng tiếng Anh, có [số giờ] giờ trùng múi giờ mỗi ngày với khách hàng ở [khu vực].","en":"The team works in English, with [N] hours of daily overlap with clients in [region]."}'::jsonb);

-- url là địa chỉ website đang chạy; để null cho đến khi có địa chỉ thật.
insert into public.projects (type, service_key, is_featured, title, summary, url, tech) values
  ('web', 'ui-ux', true, '{"vi": "[Tên dự án 01]", "en": "[Project name 01]"}'::jsonb, '{"vi": "[Mô tả 1 dòng về sản phẩm]", "en": "[One-line product description]"}'::jsonb, null, array['[Tech]','[Tech]','[Tech]']),
  ('mobile', 'mobile-app', true, '{"vi": "[Tên dự án 02]", "en": "[Project name 02]"}'::jsonb, '{"vi": "[Mô tả 1 dòng về sản phẩm]", "en": "[One-line product description]"}'::jsonb, null, array['[Tech]','[Tech]','[Tech]']),
  ('ai', 'ai-llm', true, '{"vi": "[Tên dự án 03]", "en": "[Project name 03]"}'::jsonb, '{"vi": "[Mô tả 1 dòng về sản phẩm]", "en": "[One-line product description]"}'::jsonb, null, array['[Tech]','[Tech]','[Tech]']),
  ('web', 'web-app', false, '{"vi": "[Tên dự án 04]", "en": "[Project name 04]"}'::jsonb, '{"vi": "[Mô tả 1 dòng về sản phẩm]", "en": "[One-line product description]"}'::jsonb, null, array['[Tech]','[Tech]','[Tech]']),
  ('mobile', 'mvp', false, '{"vi": "[Tên dự án 05]", "en": "[Project name 05]"}'::jsonb, '{"vi": "[Mô tả 1 dòng về sản phẩm]", "en": "[One-line product description]"}'::jsonb, null, array['[Tech]','[Tech]','[Tech]']);
  