package cr.una.skilllink.payment_service.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "payer_user_id", nullable = false)
    private Long payerUserId;

    @Column(name = "payee_user_id")
    private Long payeeUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "commission_amount", precision = 10, scale = 2)
    private BigDecimal commissionAmount;

    @Column(name = "net_amount", precision = 10, scale = 2)
    private BigDecimal netAmount;

    @Column(length = 3)
    private String currency = "CRC";

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "external_transaction_id")
    private String externalTransactionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public enum TransactionType {
        service_payment, subscription, commission, refund
    }

    public enum PaymentStatus {
        pending, completed, failed, refunded
    }

    // Getters and Setters
    public Transaction() {}
    
    public void setTransactionId(Long transactionId) { 
        this.transactionId = transactionId; 
    }
    public Long getTransactionId() { 
        return transactionId; 
    }
    public void setPayerUserId(Long payerUserId) { 
        this.payerUserId = payerUserId; 
    }
    public void setPayeeUserId(Long payeeUserId) { 
        this.payeeUserId = payeeUserId; 
    }
    public void setAmount(BigDecimal amount) { 
        this.amount = amount; 
    }
    public BigDecimal getAmount() { 
        return amount; 
    }
    public void setCommissionAmount(BigDecimal commissionAmount) { 
        this.commissionAmount = commissionAmount; 
    }
    public void setNetAmount(BigDecimal netAmount) { 
        this.netAmount = netAmount; 
    }
    public void setTransactionType(TransactionType transactionType) { 
        this.transactionType = transactionType; 
    }
    public void setSubscriptionId(Long subscriptionId) { 
        this.subscriptionId = subscriptionId; 
    }
    public void setPaymentStatus(PaymentStatus paymentStatus) { 
        this.paymentStatus = paymentStatus; 
    }
    public void setExternalTransactionId(String externalTransactionId) { 
        this.externalTransactionId = externalTransactionId; 
    }
    public void setPaymentMethod(String paymentMethod) { 
        this.paymentMethod = paymentMethod; 
    }
    public String getPaymentMethod() {
        return paymentMethod;
    }
    public void setCompletedAt(LocalDateTime completedAt) { 
        this.completedAt = completedAt; 
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    public String getCurrency() {
        return currency;
    }
}