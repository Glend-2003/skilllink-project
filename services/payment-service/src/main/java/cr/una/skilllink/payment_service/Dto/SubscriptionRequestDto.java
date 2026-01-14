package cr.una.skilllink.payment_service.Dto;

public class SubscriptionRequestDto {
    private Long providerId;
    private Long planId;
    private String paymentMethod;
    private String paymentToken;
    private String payerId;

    // Getters and Setters
    public Long getProviderId() { 
        return providerId; 
    }
    public void setProviderId(Long providerId) { 
        this.providerId = providerId; 
    }
    public Long getPlanId() { 
        return planId; 
    }
    public void setPlanId(Long planId) { 
        this.planId = planId; 
    }
    public String getPaymentMethod() { 
        return paymentMethod; 
    }
    public void setPaymentMethod(String paymentMethod) { 
        this.paymentMethod = paymentMethod; 
    }
    public String getPaymentToken() { 
        return paymentToken; 
    }
    public void setPaymentToken(String paymentToken) { 
        this.paymentToken = paymentToken; 
    }
    public String getPayerId() {
        return payerId;
    }
    public void setPayerId(String payerId) {
        this.payerId = payerId;
    }
}
