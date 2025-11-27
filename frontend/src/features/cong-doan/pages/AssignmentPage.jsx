import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { communityService, sisterService } from "@services";
import SearchBox from "@components/common/SearchBox";
import LoadingSpinner from "@components/common/Loading/LoadingSpinner";
import Breadcrumb from "@components/common/Breadcrumb";
import { formatDate } from "@utils";
import "./AssignmentPage.css";

const AssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [community, setCommunity] = useState(null);
  const [availableSisters, setAvailableSisters] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [selectedSisters, setSelectedSisters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const communityRes = await communityService.getDetail(id);
      if (communityRes) {
        setCommunity(communityRes);
      }
      const membersRes = await communityService.getMembers(id);
      if (membersRes) {
        setCurrentMembers(membersRes);
      }
      const sistersRes = await sisterService.getList({
        page_size: 1000,
        exclude_community_id: id,
      });
      if (sistersRes) {
        setAvailableSisters(sistersRes.items || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Khong the tai du lieu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSister = (sisterId) => {
    if (selectedSisters.includes(sisterId)) {
      setSelectedSisters(selectedSisters.filter((sid) => sid !== sisterId));
    } else {
      setSelectedSisters([...selectedSisters, sisterId]);
    }
  };

  const filteredSisters = availableSisters.filter(
    (sister) =>
      sister.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sister.sister_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sister.religious_name &&
        sister.religious_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (selectedSisters.length === filteredSisters.length) {
      setSelectedSisters([]);
    } else {
      setSelectedSisters(filteredSisters.map((s) => s.id));
    }
  };

  const handleAssign = async () => {
    if (selectedSisters.length === 0) {
      setError("Vui long chon it nhat mot nu tu");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      await communityService.addMember(id, {
        sister_ids: selectedSisters,
        role: "member",
        joined_date: new Date().toISOString().split("T")[0],
      });
      setSuccess("Da phan cong " + selectedSisters.length + " nu tu thanh cong");
      setSelectedSisters([]);
      fetchData();
    } catch (err) {
      console.error("Error assigning members:", err);
      setError("Co loi xay ra khi phan cong thanh vien");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Ban co chac chan muon xoa thanh vien nay khoi cong doan?")) {
      try {
        await communityService.removeMember(id, memberId);
        setSuccess("Da xoa thanh vien khoi cong doan");
        fetchData();
      } catch (err) {
        console.error("Error removing member:", err);
        setError("Co loi xay ra khi xoa thanh vien");
      }
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await communityService.updateMemberRole(id, memberId, {
        role: newRole,
      });
      setSuccess("Da cap nhat vai tro thanh cong");
      fetchData();
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Co loi xay ra khi cap nhat vai tro");
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Breadcrumb
        items={[
          { label: "Trang chu", link: "/dashboard" },
          { label: "Quan ly Cong Doan", link: "/cong-doan" },
          { label: community?.name, link: "/cong-doan/" + id },
          { label: "Phan cong thanh vien" },
        ]}
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Phan cong Thanh vien</h2>
          <p className="text-muted mb-0">
            Cong doan: <strong>{community?.name}</strong>
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/cong-doan/" + id)}>
          Quay lai
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Card>
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  Nu tu co san ({filteredSisters.length})
                </h5>
                {selectedSisters.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={handleAssign}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Dang phan cong..."
                      : "Phan cong (" + selectedSisters.length + ")"}
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tim kiem nu tu..."
                className="mb-3"
              />

              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>
                        <Form.Check
                          type="checkbox"
                          checked={
                            selectedSisters.length === filteredSisters.length &&
                            filteredSisters.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Ma so</th>
                      <th>Ho ten</th>
                      <th>Ten thanh</th>
                      <th>Ngay sinh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSisters.length > 0 ? (
                      filteredSisters.map((sister) => (
                        <tr key={sister.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedSisters.includes(sister.id)}
                              onChange={() => handleSelectSister(sister.id)}
                            />
                          </td>
                          <td>{sister.sister_code}</td>
                          <td>{sister.full_name}</td>
                          <td>{sister.religious_name || "-"}</td>
                          <td>{formatDate(sister.birth_date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Khong tim thay nu tu nao
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                Thanh vien hien tai ({currentMembers.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {currentMembers.length > 0 ? (
                <div className="members-list">
                  {currentMembers.map((member) => (
                    <Card key={member.id} className="member-card mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              {member.religious_name && (
                                <span className="text-primary me-2">
                                  {member.religious_name}
                                </span>
                              )}
                              {member.full_name}
                            </h6>
                            <small className="text-muted d-block mb-2">
                              {member.sister_code}
                            </small>

                            <Form.Select
                              size="sm"
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateRole(member.id, e.target.value)
                              }
                              className="mb-2"
                            >
                              <option value="member">Thanh vien</option>
                              <option value="superior">Be tren</option>
                              <option value="assistant">Pho be tren</option>
                              <option value="treasurer">Thu quy</option>
                              <option value="secretary">Thu ky</option>
                            </Form.Select>

                            <small className="text-muted">
                              Tham gia: {formatDate(member.joined_date)}
                            </small>
                          </div>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            X
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Chua co thanh vien nao</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentPage;
