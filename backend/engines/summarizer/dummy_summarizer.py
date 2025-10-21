from services.summarizer_interface import SummarizerEngine
from typing import List


class DummySummarizerEngine(SummarizerEngine):
    def summarize(self, ocr_text: str, document_urls: List[str]) -> str:
        print(f"--- [ENGINE: Dummy Summarizer] Summarizing content from {len(document_urls)} URLs ---")

        # The entire multi-line string is returned here
        return """[URL 1: https://vi.wikipedia.org/wiki/Trường_Đại_học_Kinh_tế_–_Kỹ_thuật_Công_nghiệp

SUMMARY: Trường Đại học Kinh tế - Kỹ thuật Công nghiệp (UNETI) là trường đại học công lập định hướng ứng dụng, trực thuộc Bộ Công Thương Việt Nam, thành lập năm 2007 trên cơ sở nâng cấp từ Trường Cao đẳng Kinh tế Kỹ thuật Công nghiệp I (1956). Trường đào tạo cử nhân và kỹ sư hệ chính quy 4 năm, với mục tiêu cung cấp nguồn nhân lực chất lượng cao cho vùng Đồng bằng sông Hồng và cả nước, hướng tới trở thành một trong những trường đại học ứng dụng hàng đầu Việt Nam vào năm 2030. UNETI có 3 cơ sở tại Hà Nội và Nam Định, với 550 giảng viên cơ hữu, trong đó gần 80% có trình độ thạc sĩ và tiến sĩ. Trường cam kết đổi mới liên tục để nâng cao chất lượng giảng dạy và cơ sở vật chất.]



[URL 2: https://cand.com.vn/giao-duc/giai-quyet-bai-toan-khan-hiem-nhan-luc-trinh-do-cao-i784890

SUMMARY: Khu vực Đồng bằng sông Cửu Long (ĐBSCL) đang đối mặt với tình trạng thiếu hụt nghiêm trọng nhân lực trình độ cao, với tỷ lệ lao động có chứng chỉ đào tạo và bằng đại học thấp nhất cả nước, dù có 17 cơ sở đại học. Các doanh nghiệp, đặc biệt là FDI, gặp khó khăn trong việc tìm kiếm nhân sự chất lượng cao, phản ánh sự thiếu kết nối giữa đào tạo và thị trường lao động. Năng suất lao động nông nghiệp thấp và di cư lao động cũng là vấn đề. Các trường đại học trong vùng như Cửu Long, Trà Vinh, và Cần Thơ đang chủ động chuyển đổi mô hình đào tạo, tập trung vào các ngành kinh tế trọng điểm (năng lượng tái tạo, logistics, công nghệ cao, AI, bán dẫn) và tăng cường hợp tác với doanh nghiệp, quốc tế để nâng cao chất lượng và đáp ứng nhu cầu phát triển kinh tế - xã hội.]



[URL 3: https://science.vnu.edu.vn/en/2025/03/17/dao-tao-nguon-nhan-luc-chat-luong-cao-va-tang-cuong-dau-tu-cho-khcn-la-yeu-to-then-chot-de-trien-khai-thanh-cong-nghi-quyet-57-nq-tw-va-nghi-quyet-03-nq-cp/

SUMMARY: ĐHQGHN đã tổ chức hội nghị triển khai Nghị quyết 57-NQ/TW và 03/NQ-CP về đột phá phát triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia, với mục tiêu đưa Việt Nam vào nhóm dẫn đầu Đông Nam Á về năng lực cạnh tranh số và AI vào năm 2030. ĐHQGHN được định hướng trở thành trung tâm nghiên cứu và đào tạo nhân lực chiến lược trong các lĩnh vực công nghệ cao. Hội nghị đã chỉ ra những thách thức về thể chế, chính sách và nguồn lực, đồng thời đề xuất các giải pháp như cải cách hành chính, tăng cường đầu tư, hợp tác quốc tế và doanh nghiệp, phát triển nguồn nhân lực "máy cái" để thúc đẩy nghiên cứu và thương mại hóa sản phẩm khoa học công nghệ.]



[URL 4: https://edunet.vn/bai-viet/TIM-HIEU-VE-TRUONG-DAI-HOC-KINH-TE-KY-THUAT-CONG-NGHIEP-8552

SUMMARY: Trường Đại học Kinh tế - Kỹ thuật Công nghiệp (UNETI) là trường đại học công lập định hướng ứng dụng, thành lập năm 2007, trực thuộc Bộ Công Thương Việt Nam. Trường đào tạo cử nhân và kỹ sư 4 năm, nhằm cung cấp nguồn nhân lực chất lượng cao cho vùng Đồng bằng sông Hồng và cả nước. UNETI có 3 cơ sở tại Nam Định và Hà Nội, với học phí năm học 2019-2021 là 16 triệu đồng/năm. Trường áp dụng nhiều phương thức tuyển sinh (xét tuyển thẳng, kết quả thi THPT, học bạ, đánh giá tư duy/năng lực) và đào tạo đa dạng các ngành từ Ngôn ngữ Anh, Quản trị kinh doanh đến Công nghệ thông tin, Kỹ thuật ô tô, Công nghệ thực phẩm, Du lịch. UNETI không ngừng hoàn thiện về chất lượng và cơ sở vật chất.]



[URL 5: https://tuvanduhocmap.com/truong-dai-hoc-khoa-hoc-va-cong-nghe-trung-quoc/

SUMMARY: Trường Đại học Khoa học và Công nghệ Trung Quốc (CUST) tại Đài Loan, thành lập năm 1968, được Bộ Giáo dục Đài Loan công nhận về đào tạo nhân lực chất lượng cao và xếp hạng 9 trong số các trường tư thục hàng đầu về kỹ thuật năm 2018. Trường có hai học xá tại Đài Bắc và Tân Trúc, với khoảng 11.000 sinh viên, trong đó có 320 sinh viên quốc tế, mạnh về các ngành quản lý và thiết kế. CUST có ba khoa chính (Thiết kế, Quản lý, Kỹ sư Thông tin & Khoa học Máy tính) với cơ sở vật chất hiện đại, ký túc xá đầy đủ tiện nghi. Trường chú trọng thực hành, hợp tác doanh nghiệp và trao đổi quốc tế. Điều kiện nhập học bao gồm tốt nghiệp THPT/CĐ/ĐH, yêu cầu về tiếng Trung (TOCFL 2) hoặc tiếng Anh (IELTS 3.0), và sức khỏe. Trường cung cấp nhiều chương trình học bổng cho sinh viên có thành tích học tập xuất sắc.]"""