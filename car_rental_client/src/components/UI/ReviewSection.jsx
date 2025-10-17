import React, { useState, useEffect } from "react";
import {
  Card,
  Rate,
  Input,
  Button,
  Form,
  Avatar,
  Divider,
  Typography,
  Space,
  Progress,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import { UserOutlined, LikeOutlined, DislikeOutlined } from "@ant-design/icons";
import ReplyList from "./ReplyList";

const { TextArea } = Input;
const { Title, Text } = Typography;

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const ReviewSection = ({ vehicleId }) => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    average: 0,
    count: 0,
    s5: 0,
    s4: 0,
    s3: 0,
    s2: 0,
    s1: 0,
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [form] = Form.useForm();

  const [repliesByReview, setRepliesByReview] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (!vehicleId) return;
    loadSummary();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(
        `${API_BASE}/vehicles/${vehicleId}/reviews?page=0&size=50`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load reviews");
      const json = await res.json();
      const list = Array.isArray(json.content)
        ? json.content
        : Array.isArray(json)
        ? json
        : [];
      setReviews(list);
      // keep only replies for present reviews
      const ids = list.map((r) => r.id);
      setRepliesByReview((prev) => {
        const next = {};
        ids.forEach((id) => {
          if (prev[id]) next[id] = prev[id];
        });
        return next;
      });
    } catch (err) {
      console.error("loadReviews error:", err);
      message.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(
        `${API_BASE}/vehicles/${vehicleId}/reviews/summary`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load summary");
      const json = await res.json();
      setSummary({
        average: json.average ?? 0,
        count: json.count ?? 0,
        s5: json.s5 ?? 0,
        s4: json.s4 ?? 0,
        s3: json.s3 ?? 0,
        s2: json.s2 ?? 0,
        s1: json.s1 ?? 0,
      });
    } catch (err) {
      console.error("loadSummary error:", err);
      message.error("Failed to load rating summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleReviewSubmit = async (values) => {
    setSubmittingReview(true);
    try {
      const payload = { rating: values.rating, content: values.comment };
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          message.error("You must be logged in to submit a review.");
        } else {
          const text = await res.text().catch(() => "");
          message.error("Failed to submit review: " + (text || res.statusText));
        }
        return;
      }
      await loadReviews();
      await loadSummary();
      form.resetFields();
      message.success("Review submitted successfully");
    } catch (err) {
      console.error("submit review error:", err);
      message.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Replies APIs ------------------------------------------------------------
  const loadRepliesForReview = async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/replies`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load replies");
      const json = await res.json();
      setRepliesByReview((prev) => ({ ...prev, [reviewId]: json }));
      return json;
    } catch (e) {
      console.error("loadRepliesForReview", e);
      message.error("Failed to load replies");
      return [];
    }
  };

  const toggleReplies = async (reviewId) => {
    setExpandedReplies((prev) => {
      const currently = !!prev[reviewId];
      return { ...prev, [reviewId]: !currently };
    });
    if (!repliesByReview[reviewId]) {
      await loadRepliesForReview(reviewId);
    }
  };

  /**
   * Create reply and return created reply DTO (so caller can scroll to it).
   * Returns created DTO object from server (or throws on error)
   */
  const handleCreateReply = async (reviewId, parentId, content) => {
    const payload = { parentId: parentId || null, content };
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || "Failed to post reply");
    }
    const created = await res.json().catch(() => null);
    // refresh replies for that review
    await loadRepliesForReview(reviewId);
    // return created DTO so caller (ReplyNode) can scroll to it
    return created;
  };

  // UI helpers ...
  const totalCount = summary.count ?? 0;
  const distribution = [
    { star: 5, count: summary.s5 ?? 0 },
    { star: 4, count: summary.s4 ?? 0 },
    { star: 3, count: summary.s3 ?? 0 },
    { star: 2, count: summary.s2 ?? 0 },
    { star: 1, count: summary.s1 ?? 0 },
  ].map((d) => ({
    ...d,
    percentage: totalCount ? (d.count / totalCount) * 100 : 0,
  }));

  return (
    <Card
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #f0f0f0",
      }}
    >
      <Title level={3} style={{ marginBottom: "24px", color: "#212245" }}>
        Reviews & Ratings
      </Title>

      {/* Summary & form omitted here for brevity - keep same as before */}
      <Row gutter={[24, 24]} className="mb-4">
        <Col lg={8} md={12} sm={24}>
          <div style={{ textAlign: "center" }}>
            {loadingSummary ? (
              <Spin />
            ) : (
              <>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    color: "#212245",
                  }}
                >
                  {(summary.average || 0).toFixed(1)}
                </div>
                <Rate
                  disabled
                  value={Number(summary.average || 0)}
                  style={{ fontSize: "20px", marginBottom: "8px" }}
                />
                <div style={{ color: "#7c8db0", fontSize: "14px" }}>
                  Based on {summary.count || 0} reviews
                </div>
              </>
            )}
          </div>
        </Col>
        <Col lg={16} md={12} sm={24}>
          <div>
            {distribution.map(({ star, count, percentage }) => (
              <div
                key={star}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ width: 60, fontSize: 14 }}>{star} stars</span>
                <Progress
                  percent={Number(percentage.toFixed(1))}
                  showInfo={false}
                  strokeColor="#f9a826"
                  style={{ flex: 1, marginRight: 12 }}
                />
                <span style={{ fontSize: 14, color: "#7c8db0", width: 30 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Divider />

      {/* Reviews list & replies */}
      <div>
        <Title level={4} style={{ color: "#212245", marginBottom: "24px" }}>
          Customer Reviews ({reviews.length})
        </Title>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {loadingReviews ? (
            <div style={{ textAlign: "center", padding: 32 }}>
              <Spin />
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <Card
                key={review.id}
                style={{
                  background: "#fafafa",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <Avatar
                    size={48}
                    src={review.avatar}
                    icon={<UserOutlined />}
                    style={{ background: "#000d6b" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text strong style={{ fontSize: 16, color: "#212245" }}>
                        {review.userName || "User"}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#7c8db0" }}>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : ""}
                      </Text>
                    </div>
                    <Rate
                      disabled
                      value={review.rating}
                      style={{ fontSize: 14, marginBottom: 8 }}
                    />
                    <div
                      style={{
                        marginBottom: 12,
                        color: "#212245",
                        lineHeight: 1.6,
                      }}
                    >
                      {review.content || review.comment}
                    </div>

                    <div
                      style={{ display: "flex", gap: 16, alignItems: "center" }}
                    >
                      <Button type="link" icon={<LikeOutlined />}>
                        Helpful ({review.helpful ?? 0})
                      </Button>
                      <Button type="link" icon={<DislikeOutlined />}>
                        Not Helpful ({review.notHelpful ?? 0})
                      </Button>
                      <Button
                        type="link"
                        onClick={() => toggleReplies(review.id)}
                      >
                        {expandedReplies[review.id]
                          ? "Hide replies"
                          : "Show replies"}
                      </Button>
                    </div>

                    {expandedReplies[review.id] && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ marginTop: 8, marginLeft: 56 }}>
                          <InlineReplyBox
                            reviewId={review.id}
                            autoShowForm={true}
                            onReply={async (content) => {
                              await handleCreateReply(review.id, null, content);
                            }}
                          />
                        </div>

                        {repliesByReview[review.id] &&
                          repliesByReview[review.id].length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <ReplyList
                                reviewId={review.id}
                                replies={repliesByReview[review.id]}
                                onReply={handleCreateReply}
                              />
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "#7c8db0" }}>
              No reviews yet. Be the first to review this car!
            </div>
          )}
        </Space>
      </div>
    </Card>
  );
};

// InlineReplyBox component (used to reply at top-level under a review)
const InlineReplyBox = ({ reviewId, onReply, autoShowForm = false }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(autoShowForm);

  const submit = async () => {
    if (!text || text.trim().length < 1) {
      message.error("Please enter reply content");
      return;
    }
    try {
      setLoading(true);
      const created = await onReply(reviewId, null, text.trim());
      setText("");
      setShowForm(false);
      message.success("Reply sent");
      if (created && created.id) {
        // scroll to created reply after a small delay
        setTimeout(() => {
          const el = document.getElementById(`reply-${created.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.transition =
              "box-shadow 0.3s ease, background-color 0.3s ease";
            el.style.boxShadow = "0 0 0 3px rgba(25, 118, 210, 0.12)";
            el.style.backgroundColor = "#f2f6fb";
            setTimeout(() => {
              el.style.boxShadow = "";
              el.style.backgroundColor = "";
            }, 1600);
          }
        }, 400);
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showForm && (
        <Button
          type="link"
          onClick={() => setShowForm(true)}
          style={{ padding: 0, fontSize: 14 }}
        >
          Reply
        </Button>
      )}
      {showForm && (
        <div>
          <TextArea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a reply..."
            disabled={loading}
          />
          <div style={{ marginTop: 8 }}>
            <Button
              type="primary"
              onClick={submit}
              loading={loading}
              disabled={loading || !text.trim()}
            >
              Submit Reply
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                setShowForm(false);
                setText("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
