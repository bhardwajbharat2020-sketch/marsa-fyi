import React, { useState, useEffect } from 'react';
import '../App.css';

const WorkflowTracker = ({ orderId, onClose }) => {
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/captain/orders/${orderId}/workflow`);
        const data = await response.json();
        
        if (response.ok) {
          setWorkflowStatus(data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch workflow status');
        console.error('Error fetching workflow status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchWorkflowStatus();
    }
  }, [orderId]);

  const getStepStatusClass = (status) => {
    if (status === 'completed') return 'completed';
    if (status === 'in_progress') return 'in-progress';
    return 'pending';
  };

  if (loading) return <div className="workflow-tracker">Loading workflow status...</div>;
  if (error) return <div className="workflow-tracker error">Error: {error}</div>;
  if (!workflowStatus) return <div className="workflow-tracker">No workflow data available</div>;

  return (
    <div className="workflow-tracker">
      <div className="workflow-header">
        <h3>Order Workflow Tracking</h3>
        <button className="btn btn-close" onClick={onClose}>×</button>
      </div>
      
      <div className="workflow-steps">
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.quotation.status)}`}>
          <div className="step-icon">1</div>
          <div className="step-content">
            <h4>Quotation</h4>
            <p>Status: {workflowStatus.quotation.status}</p>
          </div>
        </div>
        
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.survey.status)}`}>
          <div className="step-icon">2</div>
          <div className="step-content">
            <h4>Survey</h4>
            <p>Status: {workflowStatus.survey.status}</p>
          </div>
        </div>
        
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.orderConfirmation.status)}`}>
          <div className="step-icon">3</div>
          <div className="step-content">
            <h4>Order Confirmation</h4>
            <p>Status: {workflowStatus.orderConfirmation.status}</p>
          </div>
        </div>
        
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.transport.status)}`}>
          <div className="step-icon">4</div>
          <div className="step-content">
            <h4>Transport</h4>
            <p>Status: {workflowStatus.transport.status}</p>
          </div>
        </div>
        
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.logistics.status)}`}>
          <div className="step-icon">5</div>
          <div className="step-content">
            <h4>Logistics</h4>
            <p>Status: {workflowStatus.logistics.status}</p>
          </div>
        </div>
        
        <div className={`workflow-step ${getStepStatusClass(workflowStatus.payment.status)}`}>
          <div className="step-icon">6</div>
          <div className="step-content">
            <h4>Payment</h4>
            <p>Status: {workflowStatus.payment.status}</p>
          </div>
        </div>
      </div>
      
      <div className="workflow-summary">
        <h4>Order Status</h4>
        <p>Order ID: {workflowStatus.order.id}</p>
        <p>Order Status: {workflowStatus.order.status}</p>
        <p>Payment Status: {workflowStatus.order.paymentStatus}</p>
      </div>
    </div>
  );
};

export default WorkflowTracker;