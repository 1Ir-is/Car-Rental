import "./modern-card.css";
const reviewsDemo = [
  {
    id: 1,
    name: "Nguyen Van A",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    comment: "Dịch vụ rất tốt, xe sạch sẽ, chủ nhiệt tình!",
    date: "2025-10-20",
  },
  {
    id: 2,
    name: "Tran Thi B",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    comment: "Xe mới, thủ tục nhanh, sẽ quay lại lần sau.",
    date: "2025-10-18",
  },
  {
    id: 3,
    name: "Le Van C",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    rating: 5,
    comment: "Chủ xe hỗ trợ rất tốt, giá hợp lý.",
    date: "2025-10-15",
  },
];

const OwnerReviews = () => {
  return (
    <div
      className="owner-reviews modern-card"
      style={{ maxWidth: "1400px", margin: "0 auto" }}
    >
      <div className="modern-card-header">
        <div className="modern-card-icon reviews">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 2.21.896 4.21 2.343 5.657A7.963 7.963 0 0 0 12 20Z"
              stroke="#2563eb"
              strokeWidth="2"
            />
            <path
              d="M9 10h.01M15 10h.01M8 15c1.333 1 2.667 1 4 0"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="modern-card-title">Customer Reviews & Feedback</h2>
          <p className="modern-card-desc">
            View and respond to customer reviews and ratings.
          </p>
        </div>
      </div>
      <div className="modern-card-body">
        <div className="reviews-list upgraded">
          {reviewsDemo.map((r) => (
            <div className="review-card upgraded" key={r.id}>
              <div className="review-avatar-col">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="review-avatar upgraded"
                />
              </div>
              <div className="review-info upgraded">
                <div className="review-header upgraded">
                  <span className="review-name upgraded">{r.name}</span>
                  <span className="review-date upgraded">{r.date}</span>
                </div>
                <div className="review-rating upgraded">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < r.rating ? "star-active" : "star-inactive"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="review-comment upgraded">{r.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerReviews;
