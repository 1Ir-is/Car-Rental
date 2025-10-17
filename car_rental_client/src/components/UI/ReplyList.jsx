import React, { useState } from "react";
import { Avatar, Button, Input, message, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "../../styles/replies.css";

const { TextArea } = Input;
const { Text } = Typography;

/**
 * ReplyList & ReplyNode
 * - Shows "Replying to X" with clickable name + small avatar
 * - Adds "View all N replies" for nodes with many children (collapsed by default)
 * - Adds vertical connector (via CSS) to mimic Facebook thread visuals
 *
 * Expected ReplyDTO fields (from backend): id, content, createdAt, userId, userName, avatar, parentId, replyToId, replyToUserName, children[]
 */

const DEFAULT_VISIBLE_CHILDREN = 2; // number of children to show before "View all"

export const ReplyNode = ({ node, reviewId, onReply, depth = 1 }) => {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedChildren, setExpandedChildren] = useState(false);

  // Scroll to target reply and highlight (same as before)
  const scrollToReply = (targetId) => {
    if (!targetId) return;
    const el = document.getElementById(`reply-${targetId}`);
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("reply-highlight");
      setTimeout(() => el.classList.remove("reply-highlight"), 1600);
    } catch (e) {
      // ignore
    }
  };

  const submit = async () => {
    if (!text || text.trim().length < 1) {
      message.error("Please enter reply");
      return;
    }
    setSubmitting(true);
    try {
      // we expect onReply to return created DTO (with id) or null
      const created = await onReply(reviewId, node.id, text.trim());
      setText("");
      setShowForm(false);
      message.success("Reply submitted");
      if (created && created.id) {
        setTimeout(() => scrollToReply(created.id), 400);
      }
      // expand children so user sees their reply
      setExpandedChildren(true);
    } catch (e) {
      console.error(e);
      message.error("Failed to submit reply");
    } finally {
      setSubmitting(false);
    }
  };

  const children = node.children || [];
  const shouldCollapse = children.length > DEFAULT_VISIBLE_CHILDREN;
  const visibleChildren =
    shouldCollapse && !expandedChildren
      ? children.slice(0, DEFAULT_VISIBLE_CHILDREN)
      : children;

  return (
    <div
      id={`reply-${node.id}`}
      className={`reply-node reply-depth-${depth}`}
      style={{ marginTop: 12 }}
    >
      <div className="reply-row">
        <div className="reply-avatar-col">
          {node.avatar ? (
            <Avatar size={36} src={node.avatar} />
          ) : (
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ background: "#000d6b" }}
            >
              {node.userName ? node.userName.charAt(0) : "U"}
            </Avatar>
          )}
        </div>

        <div className="reply-body-col">
          <div className="reply-header">
            <Text strong style={{ fontSize: 13, color: "#212245" }}>
              {node.userName || "User"}
            </Text>
            <span className="reply-time">
              {node.createdAt ? new Date(node.createdAt).toLocaleString() : ""}
            </span>
          </div>

          {/* Replying-to indicator with small avatar and clickable name */}
          {node.replyToUserName && (
            <div
              className="replying-to"
              onClick={() => scrollToReply(node.replyToId)}
            >
              <span className="replying-to-avatar">
                {node.replyToAvatar ? (
                  <Avatar size={16} src={node.replyToAvatar} />
                ) : (
                  <Avatar size={16} icon={<UserOutlined />} />
                )}
              </span>
              <Text type="secondary" className="replying-to-text">
                Replying to{" "}
                <span className="replying-to-name">{node.replyToUserName}</span>
              </Text>
            </div>
          )}
          <div
            className="reply-content"
            style={{ whiteSpace: "pre-wrap", marginTop: 6 }}
          >
            {node.content}
          </div>

          <div className="reply-actions" style={{ marginTop: 6 }}>
            <Button
              type="link"
              onClick={() => setShowForm((s) => !s)}
              className="reply-btn"
              style={{ padding: 0, fontSize: 13, height: "auto" }}
            >
              {showForm ? "Cancel" : "Reply"}
            </Button>
          </div>

          {showForm && (
            <div className="reply-form" style={{ marginTop: 8 }}>
              <TextArea
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitting}
                placeholder="Write your reply..."
                style={{ fontSize: 13 }}
              />
              <div style={{ marginTop: 6 }}>
                <Button
                  type="primary"
                  onClick={submit}
                  loading={submitting}
                  disabled={submitting || !text.trim()}
                  size="small"
                >
                  Submit Reply
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setShowForm(false);
                    setText("");
                  }}
                  disabled={submitting}
                  size="small"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* children list */}
          {visibleChildren.length > 0 && (
            <div className="reply-children" style={{ marginTop: 8 }}>
              {visibleChildren.map((child) => (
                <div key={child.id} className="reply-child">
                  <ReplyNode
                    node={child}
                    reviewId={reviewId}
                    onReply={onReply}
                    depth={depth + 1}
                  />
                </div>
              ))}
            </div>
          )}

          {/* collapse control shown when there are more children than visibleChildren */}
          {shouldCollapse && (
            <div
              className="reply-collapse-control"
              style={{ marginTop: 6, marginLeft: 44 }}
            >
              {!expandedChildren ? (
                <Button
                  type="link"
                  onClick={() => setExpandedChildren(true)}
                  style={{ fontSize: 12, padding: 0 }}
                >
                  View all {children.length} replies
                </Button>
              ) : (
                <Button
                  type="link"
                  onClick={() => setExpandedChildren(false)}
                  style={{ fontSize: 12, padding: 0 }}
                >
                  Hide replies
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyList = ({ reviewId, replies = [], onReply }) => {
  return (
    <div className="reply-list">
      {replies.map((r) => (
        <ReplyNode
          key={r.id}
          node={r}
          reviewId={reviewId}
          onReply={onReply}
          depth={1}
        />
      ))}
    </div>
  );
};

export default ReplyList;
