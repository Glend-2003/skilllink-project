package cr.una.skilllink.payment_service.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_subscriptions")
public class ProviderSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status; // ACTIVE, CANCELLED, EXPIRED, PENDING

    @Column(name = "auto_renew")
    private Boolean autoRenew = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    public enum SubscriptionStatus {
        active, cancelled, expired, pending
    }

    // Getters and Setters
    public ProviderSubscription() {}
    
    public Long getSubscriptionId() { 
        return subscriptionId; 
    }
    public void setSubscriptionId(Long subscriptionId) { 
        this.subscriptionId = subscriptionId; 
    }
    public Long getProviderId() { 
        return providerId; 
    }
    public void setProviderId(Long providerId) { 
        this.providerId = providerId; 
    }
    public SubscriptionPlan getPlan() { 
        return plan; 
    }
    public void setPlan(SubscriptionPlan plan) { 
        this.plan = plan; 
    }
    public LocalDate getStartDate() { 
        return startDate; 
    }
    public void setStartDate(LocalDate startDate) { 
        this.startDate = startDate; 
    }
    public LocalDate getEndDate() { 
        return endDate; 
    }
    public void setEndDate(LocalDate endDate) { 
        this.endDate = endDate; 
    }
    public SubscriptionStatus getStatus() { 
        return status; 
    }
    public void setStatus(SubscriptionStatus status) { 
        this.status = status; 
    }
    public Boolean getAutoRenew() { 
        return autoRenew; 
    }
    public void setAutoRenew(Boolean autoRenew) { 
        this.autoRenew = autoRenew; 
    }
    public LocalDateTime getCancelledAt() { 
        return cancelledAt; 
    }
    public void setCancelledAt(LocalDateTime cancelledAt) { 
        this.cancelledAt = cancelledAt; 
    }
}
