package cr.una.skilllink.payment_service.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(name = "plan_description", columnDefinition = "TEXT")
    private String planDescription;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    private BillingCycle billingCycle; // Enum: MONTHLY, QUARTERLY, YEARLY

    @Column(columnDefinition = "json")
    private String features;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BillingCycle {
        monthly, quarterly, yearly
    }

    // Getters and Setters
    public SubscriptionPlan() {}

    public Long getPlanId() { 
        return planId; 
    }
    public void setPlanId(Long planId) { 
        this.planId = planId; 
    }
    public String getPlanName() { 
        return planName; 
    }
    public void setPlanName(String planName) { 
        this.planName = planName; 
    }
    public String getPlanDescription() { 
        return planDescription; 
    }
    public void setPlanDescription(String planDescription) { 
        this.planDescription = planDescription; 
    }
    public BigDecimal getPrice() { 
        return price; 
    }
    public void setPrice(BigDecimal price) { 
        this.price = price; 
    }
    public BillingCycle getBillingCycle() { 
        return billingCycle; 
    }
    public void setBillingCycle(BillingCycle billingCycle) { 
        this.billingCycle = billingCycle; 
    }
    public String getFeatures() { 
        return features; 
    }
    public void setFeatures(String features) { 
        this.features = features; 
    }
    public Boolean getActive() { 
        return isActive; 
    }
    public void setActive(Boolean active) { 
        isActive = active; 
    }
}